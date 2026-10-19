import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Backdrop } from "@/components/layout/backdrop";
import { getProfile } from "@/lib/data";

export const revalidate = 60;

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const p = await getProfile();
  return (
    <>
      <Backdrop />
      <noscript><style>{".reveal{opacity:1!important;transform:none!important;filter:none!important}"}</style></noscript>
      <a href="#main" className="sr-only z-50 rounded-control bg-accent px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to content
      </a>
      <Navbar name={p.display_name} />
      <main id="main" className="mx-auto max-w-6xl px-5 py-12">{children}</main>
      <Footer name={p.display_name} links={[["GitHub", p.github_url], ["LinkedIn", p.linkedin_url]]} />
    </>
  );
}
