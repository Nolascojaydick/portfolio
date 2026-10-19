import Link from "next/link";
import { requireAdmin } from "@/lib/auth/admin";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { Pagination } from "@/components/ui/pagination";
import { field } from "@/components/ui/field";
import { formatDate } from "@/lib/utils";

const PAGE = 20;
const clean = (s: string) => s.replace(/[%*,()\\]/g, " ").trim().slice(0, 80);
const STATUSES = { inbox: "Inbox", unread: "Unread", read: "Read", archived: "Archived" } as const;

export default async function MessagesPage({
  searchParams,
}: { searchParams: Promise<{ q?: string; status?: string; page?: string }> }) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const status = (sp.status && sp.status in STATUSES ? sp.status : "inbox") as keyof typeof STATUSES;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const q = sp.q ? clean(sp.q) : "";

  let query = supabase.from("contact_messages").select("*", { count: "exact" });
  if (status === "archived") query = query.not("archived_at", "is", null);
  else query = query.is("archived_at", null);
  if (status === "unread") query = query.eq("is_read", false);
  if (status === "read") query = query.eq("is_read", true);
  if (q) query = query.or(`sender_name.ilike.%${q}%,sender_email.ilike.%${q}%,subject.ilike.%${q}%`);
  const { data, count, error } = await query.order("created_at", { ascending: false }).range((page - 1) * PAGE, page * PAGE - 1);

  const params: Record<string, string> = { status };
  if (q) params.q = q;

  return (
    <>
      <PageHeader title="Messages" />
      <form role="search" className="mb-6 flex max-w-xl flex-wrap gap-3">
        <label htmlFor="q" className="sr-only">Search messages</label>
        <input id="q" name="q" defaultValue={sp.q} placeholder="Search sender or subject" className={`${field} min-w-48 flex-1`} />
        <select name="status" defaultValue={status} aria-label="Status" className={field}>
          {Object.entries(STATUSES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <Button type="submit" variant="secondary">Filter</Button>
      </form>

      {error ? <ErrorState message="Couldn't load messages." />
      : !data?.length ? (
        <EmptyState title="No messages here" hint="Messages sent through the contact form will appear in this list." />
      ) : (
        <ul className="divide-y divide-line rounded-card border border-line">
          {data.map((m) => (
            <li key={m.id}>
              <Link href={`/admin/messages/${m.id}`} className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3 hover:bg-surface">
                <span className={m.is_read ? "text-muted" : "font-semibold"}>
                  {m.sender_name}<span className="ml-2 text-sm font-normal text-muted">{m.subject}</span>
                </span>
                <span className="text-xs text-muted">{formatDate(m.created_at, { year: "numeric", month: "short", day: "numeric" })}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Pagination page={page} total={count ?? 0} pageSize={PAGE} basePath="/admin/messages" params={params} />
    </>
  );
}
