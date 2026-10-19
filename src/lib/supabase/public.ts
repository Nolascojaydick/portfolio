import { createClient } from "@supabase/supabase-js";

// Cookie-less, anonymous client for public pages. RLS decides what it can read,
// so drafts and private data can never come back through it.
export const publicClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
