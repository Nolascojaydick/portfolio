import Link from "next/link";

export function Pagination({
  page, total, pageSize, basePath, params = {},
}: { page: number; total: number; pageSize: number; basePath: string; params?: Record<string, string> }) {
  const pages = Math.ceil(total / pageSize);
  if (pages <= 1) return null;
  const href = (p: number) => {
    const s = new URLSearchParams(params);
    s.set("page", String(p));
    return `${basePath}?${s}`;
  };
  const link = "rounded-control border border-line px-3 py-1.5 hover:bg-raised";
  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-4 text-sm">
      {page > 1 && <Link href={href(page - 1)} className={link}>Previous</Link>}
      <span className="text-muted">Page {page} of {pages}</span>
      {page < pages && <Link href={href(page + 1)} className={link}>Next</Link>}
    </nav>
  );
}
