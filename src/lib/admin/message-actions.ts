"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";

const uuid = z.string().uuid();

async function update(id: string, patch: Record<string, unknown>) {
  const { supabase } = await requireAdmin();
  if (!uuid.safeParse(id).success) return;
  await supabase.from("contact_messages").update(patch).eq("id", id);
  revalidatePath("/admin", "layout");
}

export async function setRead(id: string, read: boolean): Promise<void> {
  await update(id, { is_read: read });
}

export async function setArchived(id: string, archived: boolean): Promise<void> {
  await update(id, { archived_at: archived ? new Date().toISOString() : null });
}

export async function deleteMessage(id: string): Promise<void> {
  const { supabase } = await requireAdmin();
  if (!uuid.safeParse(id).success) return;
  await supabase.from("contact_messages").delete().eq("id", id);
  revalidatePath("/admin", "layout");
  redirect("/admin/messages");
}
