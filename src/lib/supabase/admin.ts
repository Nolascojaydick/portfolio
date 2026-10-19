import "server-only";
import { createClient } from "@supabase/supabase-js";

// Service-role client: bypasses RLS. Import only in server code, and only after
// the request has been validated (contact form) or the caller verified as admin.
export const adminClient = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
