// Runs against your REAL Supabase project. Needs the seed data and .env.local values.
// Optional: TEST_ADMIN_EMAIL/PASSWORD (an admin_users account) and TEST_USER_EMAIL/PASSWORD (a normal user).
import { describe, expect, it } from "vitest";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const { TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD, TEST_USER_EMAIL, TEST_USER_PASSWORD } = process.env;

const client = () => createClient(url!, key!, { auth: { persistSession: false, autoRefreshToken: false } });
async function signedIn(email: string, password: string) {
  const c = client();
  const { error } = await c.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`Test sign-in failed: ${error.message}`);
  return c;
}
const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);

describe.skipIf(!url || !key)("anonymous visitor", () => {
  const anon = client();

  it("sees only published projects", async () => {
    const { data, error } = await anon.from("projects").select("slug,published");
    expect(error).toBeNull();
    expect(data!.every((p) => p.published)).toBe(true);
  });
  it("cannot load a draft project by slug", async () => {
    const { data } = await anon.from("projects").select("*").eq("slug", "draft-project").maybeSingle();
    expect(data).toBeNull();
  });
  it("cannot read contact messages", async () => {
    const { data } = await anon.from("contact_messages").select("*");
    expect(data ?? []).toHaveLength(0);
  });
  it("cannot insert contact messages directly", async () => {
    const { error } = await anon.from("contact_messages").insert({ sender_name: "x", sender_email: "x@x.co", subject: "x", message: "x" });
    expect(error).not.toBeNull();
  });
  it("cannot write projects", async () => {
    const { error } = await anon.from("projects").insert({ title: "hack", slug: "hack" });
    expect(error).not.toBeNull();
  });
  it("cannot read the admin allowlist or rate limits", async () => {
    expect((await anon.from("admin_users").select("*")).data ?? []).toHaveLength(0);
    expect((await anon.from("rate_limits").select("*")).data ?? []).toHaveLength(0);
  });
  it("cannot call the rate-limit function", async () => {
    const { error } = await anon.rpc("check_rate_limit", { p_key: "x", p_limit: 1, p_window_seconds: 60 });
    expect(error).not.toBeNull();
  });
  it("cannot upload to storage", async () => {
    const { error } = await anon.storage.from("project-images").upload(`anon-${Date.now()}.png`, png, { contentType: "image/png" });
    expect(error).not.toBeNull();
  });
});

describe.skipIf(!url || !key || !TEST_USER_EMAIL || !TEST_USER_PASSWORD)("signed-in non-admin", () => {
  it("cannot create projects", async () => {
    const c = await signedIn(TEST_USER_EMAIL!, TEST_USER_PASSWORD!);
    const { error } = await c.from("projects").insert({ title: "nope", slug: `nope-${Date.now()}` });
    expect(error).not.toBeNull();
  });
  it("cannot upload files", async () => {
    const c = await signedIn(TEST_USER_EMAIL!, TEST_USER_PASSWORD!);
    const { error } = await c.storage.from("project-images").upload(`user-${Date.now()}.png`, png, { contentType: "image/png" });
    expect(error).not.toBeNull();
  });
});

describe.skipIf(!url || !key || !TEST_ADMIN_EMAIL || !TEST_ADMIN_PASSWORD)("administrator", () => {
  it("can create, update and delete a project; duplicate slugs are rejected", async () => {
    const admin = await signedIn(TEST_ADMIN_EMAIL!, TEST_ADMIN_PASSWORD!);
    const slug = `rls-test-${Date.now()}`;

    const created = await admin.from("projects").insert({ title: "RLS test", slug, published: false }).select("id").single();
    expect(created.error).toBeNull();
    const id = created.data!.id;

    const updated = await admin.from("projects").update({ title: "RLS test (edited)" }).eq("id", id);
    expect(updated.error).toBeNull();

    const dup = await admin.from("projects").insert({ title: "Dup", slug });
    expect(dup.error?.code).toBe("23505");

    const asAnon = await client().from("projects").select("id").eq("id", id).maybeSingle();
    expect(asAnon.data).toBeNull(); // still a draft

    expect((await admin.from("projects").delete().eq("id", id)).error).toBeNull();
  });
  it("can read contact messages", async () => {
    const admin = await signedIn(TEST_ADMIN_EMAIL!, TEST_ADMIN_PASSWORD!);
    expect((await admin.from("contact_messages").select("id").limit(1)).error).toBeNull();
  });
});
