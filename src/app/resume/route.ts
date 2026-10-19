import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import { getProfile } from "@/lib/data";

export const dynamic = "force-dynamic";

// The résumé bucket is private. Visitors get a signed link that expires in 60 seconds.
export async function GET() {
  const { resume_url: stored } = await getProfile();
  if (!stored) return new NextResponse("Not found", { status: 404 });
  if (/^https?:\/\//i.test(stored)) return NextResponse.redirect(stored); // legacy: external link

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return new NextResponse("Not available", { status: 503 });
  const { data, error } = await adminClient().storage.from("resumes").createSignedUrl(stored, 60);
  if (error || !data) return new NextResponse("Not found", { status: 404 });
  return NextResponse.redirect(data.signedUrl);
}
