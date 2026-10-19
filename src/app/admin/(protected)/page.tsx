import { requireAdmin } from "@/lib/auth/admin";
import { ErrorState } from "@/components/ui/states";

export default async function AdminOverview() {
  const { supabase } = await requireAdmin();

  const count = (table: string, filter?: (q: any) => any) => {
    const q = supabase.from(table).select("*", { count: "exact", head: true });
    return filter ? filter(q) : q;
  };

  const [projects, posts, skills, unread] = await Promise.all([
    count("projects", (q) => q.eq("published", true)),
    count("blog_posts"),
    count("skills"),
    count("contact_messages", (q) => q.eq("is_read", false)),
  ]);

  const failed = [projects, posts, skills, unread].find((r) => r.error);
  if (failed?.error) return <ErrorState message="Couldn't load the dashboard numbers. Check your Supabase keys and migrations." />;

  const stats = [
    ["Published projects", projects.count],
    ["Blog posts", posts.count],
    ["Skills", skills.count],
    ["Unread messages", unread.count],
  ] as const;

  return (
    <>
      <h1 className="text-2xl font-semibold">Overview</h1>
      <dl className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-card border border-line bg-surface p-5">
            <dt className="text-sm text-muted">{label}</dt>
            <dd className="mt-1 font-display text-3xl font-semibold">{value ?? 0}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}
