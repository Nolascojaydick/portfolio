import type { MetadataRoute } from "next";
import { publicClient } from "@/lib/supabase/public";

export const revalidate = 3600;

// Uses the anonymous client, so RLS guarantees drafts can never appear here.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const db = publicClient();
  const [projects, posts] = await Promise.all([
    db.from("projects").select("slug,updated_at").eq("published", true),
    db.from("blog_posts").select("slug,updated_at").eq("published", true),
  ]);
  const pages = ["", "/about", "/projects", "/skills", "/experience", "/blog", "/contact"].map((p) => ({ url: `${base}${p}` }));
  return [
    ...pages,
    ...(projects.data ?? []).map((r) => ({ url: `${base}/projects/${r.slug}`, lastModified: r.updated_at })),
    ...(posts.data ?? []).map((r) => ({ url: `${base}/blog/${r.slug}`, lastModified: r.updated_at })),
  ];
}
