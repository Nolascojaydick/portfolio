import Link from "next/link";

const links = [
  ["Projects", "/projects"], ["Skills", "/skills"], ["Experience", "/experience"],
  ["Blog", "/blog"], ["About", "/about"], ["Contact", "/contact"],
] as const;

export function Navbar({ name }: { name: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink/85 backdrop-blur">
      <nav aria-label="Main" className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="font-display text-lg font-semibold">{name}</Link>
        <ul className="hidden gap-6 text-sm text-muted md:flex">
          {links.map(([label, href]) => (
            <li key={href}><Link href={href} className="link-u hover:text-text">{label}</Link></li>
          ))}
        </ul>
        <details className="relative md:hidden">
          <summary className="cursor-pointer list-none rounded-control border border-line px-3 py-1.5 text-sm">Menu</summary>
          <ul className="absolute right-0 mt-2 w-44 rounded-card border border-line bg-surface p-2 text-sm">
            {links.map(([label, href]) => (
              <li key={href}><Link href={href} className="block rounded-control px-3 py-2 hover:bg-raised">{label}</Link></li>
            ))}
          </ul>
        </details>
      </nav>
    </header>
  );
}
