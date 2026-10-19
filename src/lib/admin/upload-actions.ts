"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/auth/admin";
import { isPdf, sniffImage } from "./sniff";

export type UploadState = { url?: string; path?: string; error?: string };
export type GalleryState = { ok?: boolean; error?: string };

const MB = 1024 * 1024;
const IMAGE_BUCKETS: Record<string, { max: number; mimes: string[] }> = {
  "project-images": { max: 5 * MB, mimes: ["image/jpeg", "image/png", "image/webp", "image/avif"] },
  "blog-images": { max: 5 * MB, mimes: ["image/jpeg", "image/png", "image/webp", "image/avif"] },
  "profile-assets": { max: 2 * MB, mimes: ["image/jpeg", "image/png", "image/webp"] },
};

async function storeImage(supabase: SupabaseClient, bucket: string, file: unknown): Promise<UploadState> {
  const rule = IMAGE_BUCKETS[bucket];
  if (!rule) return { error: "Unknown upload location." };
  if (!(file instanceof File) || file.size === 0) return { error: "Choose an image first." };
  if (file.size > rule.max) return { error: `The image must be under ${rule.max / MB} MB.` };

  const bytes = new Uint8Array(await file.arrayBuffer());
  const kind = sniffImage(bytes);
  if (!kind || !rule.mimes.includes(kind.mime)) return { error: "Use a JPEG, PNG or WebP image (AVIF for project and blog images)." };

  const path = `${randomUUID()}.${kind.ext}`; // name and extension come from the sniffed type
  const { error } = await supabase.storage.from(bucket).upload(path, bytes, {
    contentType: kind.mime, upsert: false, cacheControl: "31536000",
  });
  if (error) return { error: "The upload failed. Please try again." };
  return { url: supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl, path };
}

export async function uploadImage(bucket: string, fd: FormData): Promise<UploadState> {
  const { supabase } = await requireAdmin();
  return storeImage(supabase, bucket, fd.get("file"));
}

export async function uploadResume(fd: FormData): Promise<UploadState> {
  const { supabase } = await requireAdmin();
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a PDF first." };
  if (file.size > 5 * MB) return { error: "The résumé must be under 5 MB." };
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!isPdf(bytes)) return { error: "Only PDF files are allowed." };

  const path = `resume-${randomUUID()}.pdf`;
  const { error } = await supabase.storage.from("resumes").upload(path, bytes, {
    contentType: "application/pdf", upsert: false,
  });
  return error ? { error: "The upload failed. Please try again." } : { path };
}

const uuid = z.string().uuid();

export async function addGalleryImage(projectId: string, _prev: GalleryState, fd: FormData): Promise<GalleryState> {
  const { supabase } = await requireAdmin();
  if (!uuid.safeParse(projectId).success) return { error: "Invalid project." };
  const alt = String(fd.get("alt_text") ?? "").trim().slice(0, 200);

  const stored = await storeImage(supabase, "project-images", fd.get("file"));
  if (stored.error || !stored.url) return { error: stored.error };

  const { count } = await supabase.from("project_images").select("*", { count: "exact", head: true }).eq("project_id", projectId);
  const { error } = await supabase.from("project_images").insert({
    project_id: projectId, image_url: stored.url, alt_text: alt, display_order: count ?? 0,
  });
  if (error) {
    await supabase.storage.from("project-images").remove([stored.path!]); // don't leave an orphan
    return { error: "Couldn't save the image." };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteGalleryImage(id: string): Promise<void> {
  const { supabase } = await requireAdmin();
  if (!uuid.safeParse(id).success) return;
  const { data } = await supabase.from("project_images").select("image_url").eq("id", id).maybeSingle();
  await supabase.from("project_images").delete().eq("id", id);
  const marker = "/project-images/";
  const i = data?.image_url?.indexOf(marker) ?? -1;
  if (data && i >= 0) await supabase.storage.from("project-images").remove([data.image_url.slice(i + marker.length)]);
  revalidatePath("/", "layout");
}
