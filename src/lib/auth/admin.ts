import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

// Returns the signed-in user only if they are on the admin_users allowlist.
export async function getAdmin(client?: SupabaseClient) {
  const supabase = client ?? (await createClient());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: row } = await supabase
    .from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
  return row ? { user, supabase } : null;
}

// Call at the top of every admin page and every admin server action.
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
