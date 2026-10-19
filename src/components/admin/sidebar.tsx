import Link from "next/link";
import { logout } from "@/app/admin/login/actions";
import { Button } from "@/components/ui/button";

const links = [
  ["Overview", "/admin"], ["Projects", "/admin/projects"], ["Skills", "/admin/skills"],
  ["Experience", "/admin/experience"], ["Education", "/admin/education"],
  ["Certifications", "/admin/certifications"], ["Blog", "/admin/blog"],
  ["Messages", "/admin/messages"], ["Settings", "/admin/settings"],
] as const;

export function AdminSidebar({ email }: { email: string }) {
  return (
    <aside className="flex w-full flex-col gap-6 border-b border-line bg-surface p-5 md:min-h-screen md:w-60 md:border-b-0 md:border-r">
      <div className="flex items-center justify-between">
        <p className="font-display text-lg font-semibold">Admin</p>
        <Link href="/" className="text-xs text-muted hover:text-text">View site</Link>
      </div>
      <nav aria-label="Admin" className="flex-1">
        <ul className="flex flex-wrap gap-1 text-sm md:block md:space-y-1">
          {links.map(([label, href]) => (
            <li key={href}>
              <Link href={href} className="block rounded-control px-3 py-2 hover:bg-raised">{label}</Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="space-y-3">
        <p className="truncate text-xs text-muted">{email}</p>
        <form action={logout}>
          <Button type="submit" variant="secondary" className="w-full">Sign out</Button>
        </form>
      </div>
    </aside>
  );
}
