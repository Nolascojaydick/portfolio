"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";

export type SeoState = { ok?: boolean; error?: string };

const schema = z.object({
  site_title: z.string().trim().max(70),
  site_description: z.string().trim().max(200),
});

export async function saveSeo(_prev: SeoState, fd: FormData): Promise<SeoState> {
  const { supabase } = await requireAdmin();
  const parsed = schema.safeParse({ site_title: fd.get("site_title") ?? "", site_description: fd.get("site_description") ?? "" });
  if (!parsed.success) return { error: "The title can be up to 70 characters and the description up to 200." };
  const { error } = await supabase.from("site_settings").upsert({ key: "public.seo", value: parsed.data }, { onConflict: "key" });
  if (error) return { error: "Couldn't save. Please try again." };
  revalidatePath("/", "layout");
  return { ok: true };
}
