import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { getResource } from "@/lib/admin/resources";
import { deleteResource, toggleField } from "@/lib/admin/actions";
import { PageHeader } from "@/components/admin/page-header";
import { DeleteButton } from "@/components/admin/delete-button";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { Pagination } from "@/components/ui/pagination";
import { field } from "@/components/ui/field";

const PAGE = 20;
const LABELS = { published: ["Publish", "Unpublish"], featured: ["Feature", "Unfeature"] } as const;
const clean = (s: string) => s.replace(/[%*,()\\]/g, " ").trim().slice(0, 80);

const cell = (v: unknown) => {
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (v == null || v === "") return "—";
  const s = String(v).slice(0, 10).match(/^\d{4}-\d{2}-\d{2}$/) ? String(v).slice(0, 10) : String(v);
  return s.length > 60 ? `${s.slice(0, 57)}…` : s;
};

export default async function ResourceList({
  params, searchParams,
}: { params: Promise<{ resource: string }>; searchParams: Promise<{ q?: string; page?: string }> }) {
  const { resource } = await params;
  const r = getResource(resource);
  if (!r || r.singleton) notFound();
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const q = sp.q ? clean(sp.q) : "";

  let query = (supabase as any).from(r.table).select("*", { count: "exact" });
  if (q) query = query.ilike(r.titleField, `%${q}%`);
  r.order.forEach((o) => { query = query.order(o.col, { ascending: o.asc }); });
  const { data, count, error } = await query.range((page - 1) * PAGE, page * PAGE - 1);

  const labelFor = (c: string) => r.fields.find((f) => f.name === c)?.label ?? c;

  return (
    <>
      <PageHeader title={r.title} action={<ButtonLink href={`/admin/${r.key}/new`}>Add {r.singular}</ButtonLink>} />
      <form role="search" className="mb-6 flex max-w-md gap-3">
        <label htmlFor="q" className="sr-only">Search {r.title}</label>
        <input id="q" name="q" defaultValue={sp.q} placeholder={`Search ${r.title.toLowerCase()}`} className={`${field} flex-1`} />
        <Button type="submit" variant="secondary">Search</Button>
      </form>

      {error ? <ErrorState message="Couldn't load this list. Check your connection and try again." />
      : !data?.length ? (
        <EmptyState title={q ? "Nothing matches that search" : `No ${r.title.toLowerCase()} yet`}
          hint={q ? "Try a different word." : `Add your first ${r.singular} to get started.`}
          href={q ? `/admin/${r.key}` : `/admin/${r.key}/new`} cta={q ? "Clear search" : `Add ${r.singular}`} />
      ) : (
        <div className="overflow-x-auto rounded-card border border-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-muted">
              <tr>
                {r.columns.map((c) => <th key={c} scope="col" className="px-4 py-3 font-medium">{labelFor(c)}</th>)}
                <th scope="col" className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row: any) => (
                <tr key={row.id} className="border-t border-line">
                  {r.columns.map((c, i) => (
                    <td key={c} className="px-4 py-3">
                      {i === 0 ? <Link href={`/admin/${r.key}/${row.id}/edit`} className="font-medium hover:text-accent">{cell(row[c])}</Link> : cell(row[c])}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <ButtonLink href={`/admin/${r.key}/${row.id}/edit`} variant="secondary">Edit</ButtonLink>
                      {r.toggles?.map((t) => (
                        <form key={t} action={toggleField.bind(null, r.key, row.id, t, !row[t])}>
                          <Button type="submit" variant="ghost">{LABELS[t][row[t] ? 1 : 0]}</Button>
                        </form>
                      ))}
                      {r.publicPath && row.published && (
                        <Link href={r.publicPath(row)} target="_blank" className="px-2 text-sm text-accent hover:underline">View</Link>
                      )}
                      <DeleteButton action={deleteResource.bind(null, r.key, row.id)} label={String(row[r.titleField])} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={page} total={count ?? 0} pageSize={PAGE} basePath={`/admin/${r.key}`} params={q ? { q } : {}} />
    </>
  );
}
