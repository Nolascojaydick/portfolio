import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { Pagination } from "@/components/ui/pagination";
import { BlogCard } from "@/components/portfolio/post-card";
import { field } from "@/components/ui/field";
import { getPosts, PAGE_SIZE } from "@/lib/data";

export const metadata: Metadata = { title: "Blog" };

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const { items, total } = await getPosts({ q: sp.q, page });
  const params: Record<string, string> = sp.q ? { q: sp.q } : {};

  return (
    <>
      <h1 className="text-3xl font-semibold sm:text-4xl">Blog</h1>
      <form role="search" className="mb-10 mt-8 flex gap-3">
        <label htmlFor="q" className="sr-only">Search posts</label>
        <input id="q" name="q" defaultValue={sp.q} placeholder="Search posts" className={`${field} flex-1`} />
        <Button type="submit">Search</Button>
      </form>
      {items.length ? (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{items.map((x) => <BlogCard key={x.slug} post={x} />)}</div>
          <Pagination page={page} total={total} pageSize={PAGE_SIZE} basePath="/blog" params={params} />
        </>
      ) : sp.q ? (
        <EmptyState title="No posts match that search" hint="Try a different word." href="/blog" cta="Clear search" />
      ) : (
        <EmptyState title="No posts published yet" hint="Published articles will appear here." />
      )}
    </>
  );
}
