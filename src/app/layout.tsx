import type { Metadata } from "next";
import { Bricolage_Grotesque, Public_Sans } from "next/font/google";
import { getProfile } from "@/lib/data";
import { publicClient } from "@/lib/supabase/public";
import "./globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage" });
const sans = Public_Sans({ subsets: ["latin"], variable: "--font-public" });

export async function generateMetadata(): Promise<Metadata> {
  const [p, seo] = await Promise.all([
    getProfile(),
    publicClient().from("site_settings").select("value").eq("key", "public.seo").maybeSingle(),
  ]);
  const s = (seo.data?.value ?? {}) as { site_title?: string; site_description?: string };
  const title = s.site_title || `${p.display_name}, ${p.professional_title}`;
  const description = s.site_description || p.biography;
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: { default: title, template: `%s | ${p.display_name}` },
    description,
    alternates: { canonical: "./" }, // each page points to its own clean URL
    openGraph: { type: "website", siteName: p.display_name, title, description },
    twitter: { card: "summary" },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
