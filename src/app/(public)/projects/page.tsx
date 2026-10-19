import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { Pagination } from "@/components/ui/pagination";
import { ProjectCard } from "@/components/portfolio/project-card";
import { field } from "@/components/ui/field";
import { getProjects, getProjectFilters, PAGE_SIZE } from "@/lib/data";

export const metadata: Metadata = { title: "Projects" };

type SP = Promise<{ q?: string; tag?: string; category?: string; page?: string }>;

export default async function ProjectsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const [{ items, total }, filters] = await Promise.all([
    getProjects({ q: sp.q, tag: sp.tag, category: sp.category, page }),
    getProjectFilters(),
  ]);
  const params: Record<string, string> = {};
  (["q", "tag", "category"] as const).forEach((k) => { if (sp[k]) params[k] = sp[k]!; });
  const filtered = Object.keys(params).length > 0;

  return (
    <>
      <h1 className="text-3xl font-semibold sm:text-4xl">Projects</h1>
      <form role="search" className="mb-10 mt-8 flex flex-wrap gap-3">
        <label htmlFor="q" className="sr-only">Search projects</label>
        <input id="q" name="q" defaultValue={sp.q} placeholder="Search projects" className={`${field} min-w-48 flex-1`} />
        <select name="category" defaultValue={sp.category ?? ""} aria-label="Category" className={field}>
          <option value="">All categories</option>
          {filters.categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select name="tag" defaultValue={sp.tag ?? ""} aria-label="Technology" className={field}>
          <option value="">All technologies</option>
          {filters.tags.map((t) => <option key={t.slug} value={t.slug}>{t.name}</option>)}
        </select>
        <Button type="submit">Search</Button>
      </form>

      {items.length ? (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((x) => <ProjectCard key={x.slug} project={x} />)}
          </div>
          <Pagination page={page} total={total} pageSize={PAGE_SIZE} basePath="/projects" params={params} />
        </>
      ) : filtered ? (
        <EmptyState title="No projects match those filters" hint="Try a different word or clear the filters." href="/projects" cta="Clear filters" />
      ) : (
        <EmptyState title="No projects published yet" hint="Published projects will appear here." />
      )}
    </>
  );
}
