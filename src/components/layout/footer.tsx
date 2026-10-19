import { safeUrl } from "@/lib/utils";

export function Footer({
  name, links = [],
}: { name: string; links?: [string, string | null][] }) {
  const shown = links.filter(([, url]) => safeUrl(url));
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm text-muted">
        <span>© {new Date().getFullYear()} {name}</span>
        {shown.length > 0 && (
          <ul className="flex gap-5">
            {shown.map(([label, url]) => (
              <li key={label}>
                <a href={url!} target="_blank" rel="noopener noreferrer" className="hover:text-text">{label}</a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </footer>
  );
}
