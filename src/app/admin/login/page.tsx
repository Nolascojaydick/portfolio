import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth/admin";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false } };

export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin");
  return (
    <div className="mx-auto mt-24 w-full max-w-sm px-5">
      <h1 className="text-2xl font-semibold">Admin sign in</h1>
      <p className="mb-8 mt-2 text-sm text-muted">Use the account you created in Supabase.</p>
      <LoginForm />
    </div>
  );
}
