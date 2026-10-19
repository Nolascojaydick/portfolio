import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/admin";
import { AdminSidebar } from "@/components/admin/sidebar";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdmin(); // re-checked on the server for every request
  return (
    <div className="md:flex">
      <AdminSidebar email={user.email ?? ""} />
      <div className="flex-1 p-6 md:p-10">{children}</div>
    </div>
  );
}
