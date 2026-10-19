"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { buildSchema, getResource, slugify, type Resource } from "./resources";

export type FormState = { error?: string; fieldErrors?: Record<string, string>; ok?: boolean };

const uuid = z.string().uuid();

function dbMessage(error: { code?: string }) {
  if (error.code === "23505") return "That URL slug is already in use. Choose another.";
  if (error.code === "23514") return "Some values aren't allowed. Check the dates and numbers.";
  return "Couldn't save. Please try again.";
}

async function saveTags(db: any, t: NonNullable<Resource["tags"]>, itemId: string, input: string) {
  const names = [...new Set(input.split(",").map((s) => s.trim()).filter(Boolean))].slice(0, 15);
  if (names.some((n) => n.length > 40)) return "Each tag must be 40 characters or fewer.";
  const bySlug = new Map(names.map((name) => [slugify(name), name] as const));
  bySlug.delete("");

  const del = await db.from(t.junction).delete().eq(t.fk, itemId);
  if (del.error) return "Couldn't update tags.";
  if (!bySlug.size) return null;

  const rows = [...bySlug].map(([slug, name]) => ({ slug, name }));
  const up = await db.from("tags").upsert(rows, { onConflict: "slug", ignoreDuplicates: true });
  if (up.error) return "Couldn't update tags.";
  const { data: found, error } = await db.from("tags").select("id").in("slug", [...bySlug.keys()]);
  if (error) return "Couldn't update tags.";
  const link = await db.from(t.junction).insert(found.map((x: any) => ({ [t.fk]: itemId, tag_id: x.id })));
  return link.error ? "Couldn't update tags." : null;
}

export async function saveResource(
  key: string, id: string | null, _prev: FormState, fd: FormData,
): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const db = supabase as any;
  const r = getResource(key);
  if (!r) return { error: "Unknown section." };
  if (id && !uuid.safeParse(id).success) return { error: "Invalid item." };

  const raw: Record<string, unknown> = {};
  for (const f of r.fields) raw[f.name] = f.type === "checkbox" ? fd.get(f.name) === "on" : String(fd.get(f.name) ?? "");
  if (r.slugFrom && !String(raw.slug).trim()) raw.slug = slugify(String(raw[r.slugFrom]));

  const parsed = buildSchema(r).safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.issues.forEach((i) => { fieldErrors[String(i.path[0])] ??= i.message; });
    return { error: "Check the highlighted fields.", fieldErrors };
  }
  const values = parsed.data as Record<string, any>;
  r.normalize?.(values);
  const problem = r.validate?.(values);
  if (problem) return { error: problem };

  if (r.singleton && !id) {
    const { data } = await db.from(r.table).select("id").limit(1).maybeSingle();
    id = data?.id ?? null;
  }

  if (r.publishedAt && values.published && !values[r.publishedAt]) {
    let existing: string | null = null;
    if (id) {
      const { data } = await db.from(r.table).select(r.publishedAt).eq("id", id).maybeSingle();
      existing = data?.[r.publishedAt] ?? null;
    }
    values[r.publishedAt] = existing ?? new Date().toISOString();
  }

  const q = id
    ? db.from(r.table).update(values).eq("id", id).select("id").single()
    : db.from(r.table).insert(values).select("id").single();
  const { data, error } = await q;
  if (error) return { error: dbMessage(error) };

  if (r.tags) {
    const err = await saveTags(db, r.tags, data.id, String(fd.get("tags") ?? ""));
    if (err) return { error: err };
  }

  revalidatePath("/", "layout");
  if (r.singleton) return { ok: true };
  redirect(`/admin/${key}`);
}

export async function deleteResource(key: string, id: string): Promise<void> {
  const { supabase } = await requireAdmin();
  const r = getResource(key);
  if (!r || r.singleton || !uuid.safeParse(id).success) return;
  await (supabase as any).from(r.table).delete().eq("id", id);
  revalidatePath("/", "layout");
  redirect(`/admin/${key}`);
}

export async function toggleField(key: string, id: string, field: string, next: boolean): Promise<void> {
  const { supabase } = await requireAdmin();
  const r = getResource(key);
  if (!r || !uuid.safeParse(id).success || !(r.toggles as string[] | undefined)?.includes(field)) return;
  const db = supabase as any;
  const patch: Record<string, unknown> = { [field]: next };
  if (field === "published" && next && r.publishedAt) {
    const { data } = await db.from(r.table).select(r.publishedAt).eq("id", id).maybeSingle();
    if (!data?.[r.publishedAt]) patch[r.publishedAt] = new Date().toISOString();
  }
  await db.from(r.table).update(patch).eq("id", id);
  revalidatePath("/", "layout");
}
