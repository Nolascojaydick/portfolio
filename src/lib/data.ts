import { publicClient } from "@/lib/supabase/public";
import { profileFallback } from "@/lib/profile-fallback";

export const PAGE_SIZE = 9;

export type Tag = { name: string; slug: string };
export type ProjectCard = {
  slug: string; title: string; short_description: string;
  cover_image_url: string | null; category: string | null; tags: string[];
};
export type PostCard = {
  slug: string; title: string; excerpt: string; cover_image_url: string | null;
  published_at: string | null; tags: Tag[];
};

// Strip characters that would break a PostgREST filter string.
const clean = (s: string) => s.replace(/[%*,()\\]/g, " ").trim().slice(0, 80);
const tagsOf = (rows: any[] | null): Tag[] =>
  (rows ?? []).map((r) => r.tags).filter(Boolean);
const fail = (what: string): never => { throw new Error(`Couldn't load ${what}.`); };

export async function getProfile() {
  const { data } = await publicClient().from("profiles").select("*").limit(1).maybeSingle();
  return {
    ...profileFallback,
    location: null as string | null,
    avatar_url: null as string | null,
    resume_url: null as string | null,
    public_email: null as string | null,
    website_url: null as string | null,
    ...(data ?? {}),
  };
}

const toCard = (r: any): ProjectCard => ({
  slug: r.slug, title: r.title, short_description: r.short_description,
  cover_image_url: r.cover_image_url, category: r.category,
  tags: tagsOf(r.project_tags).map((t) => t.name),
});

export async function getProjects(opts: {
  q?: string; tag?: string; category?: string; featured?: boolean; page?: number; limit?: number;
}) {
  const db = publicClient();
  const limit = opts.limit ?? PAGE_SIZE;
  const page = Math.max(1, opts.page ?? 1);

  let ids: string[] | null = null;
  if (opts.tag) {
    const { data: t } = await db.from("tags").select("id").eq("slug", opts.tag).maybeSingle();
    if (!t) return { items: [] as ProjectCard[], total: 0 };
    const { data: pt } = await db.from("project_tags").select("project_id").eq("tag_id", t.id);
    ids = (pt ?? []).map((r) => r.project_id);
    if (!ids.length) return { items: [] as ProjectCard[], total: 0 };
  }

  let query = db
    .from("projects")
    .select("slug,title,short_description,cover_image_url,category,project_tags(tags(name,slug))", { count: "exact" })
    .eq("published", true);
  if (ids) query = query.in("id", ids);
  if (opts.category) query = query.eq("category", opts.category);
  if (opts.featured) query = query.eq("featured", true);
  const q = opts.q ? clean(opts.q) : "";
  if (q) query = query.or(`title.ilike.%${q}%,short_description.ilike.%${q}%`);

  const { data, count, error } = await query
    .order("featured", { ascending: false })
    .order("display_order")
    .order("published_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);
  if (error) fail("projects");
  return { items: (data ?? []).map(toCard), total: count ?? 0 };
}

export async function getProjectBySlug(slug: string) {
  const { data, error } = await publicClient()
    .from("projects")
    .select("*, project_images(*), project_tags(tags(name,slug))")
    .eq("slug", slug)
    .eq("published", true) // belt and braces on top of RLS
    .maybeSingle();
  if (error) fail("the project");
  if (!data) return null;
  return {
    ...data,
    tags: tagsOf(data.project_tags),
    images: [...(data.project_images ?? [])].sort((a: any, b: any) => a.display_order - b.display_order),
  };
}

export async function getProjectFilters() {
  const db = publicClient();
  const [cats, tags] = await Promise.all([
    db.from("projects").select("category").eq("published", true),
    db.from("project_tags").select("tags(name,slug)"), // RLS limits this to published projects
  ]);
  const categories = [...new Set((cats.data ?? []).map((r) => r.category).filter(Boolean))] as string[];
  const seen = new Map<string, Tag>();
  tagsOf(tags.data).forEach((t) => seen.set(t.slug, t));
  return { categories: categories.sort(), tags: [...seen.values()].sort((a, b) => a.name.localeCompare(b.name)) };
}

export async function getSkills() {
  const { data, error } = await publicClient().from("skills").select("*").order("display_order");
  if (error) fail("skills");
  return data ?? [];
}

export async function getExperience() {
  const { data, error } = await publicClient()
    .from("experience").select("*")
    .order("is_current", { ascending: false }).order("start_date", { ascending: false });
  if (error) fail("experience");
  return data ?? [];
}

export async function getEducation() {
  const { data } = await publicClient().from("education").select("*").order("display_order");
  return data ?? [];
}

export async function getCertifications() {
  const { data } = await publicClient().from("certifications").select("*").order("display_order");
  return data ?? [];
}

const toPost = (r: any): PostCard => ({
  slug: r.slug, title: r.title, excerpt: r.excerpt, cover_image_url: r.cover_image_url,
  published_at: r.published_at, tags: tagsOf(r.post_tags),
});

export async function getPosts(opts: { q?: string; page?: number; limit?: number } = {}) {
  const limit = opts.limit ?? PAGE_SIZE;
  const page = Math.max(1, opts.page ?? 1);
  let query = publicClient()
    .from("blog_posts")
    .select("slug,title,excerpt,cover_image_url,published_at,post_tags(tags(name,slug))", { count: "exact" })
    .eq("published", true);
  const q = opts.q ? clean(opts.q) : "";
  if (q) query = query.or(`title.ilike.%${q}%,excerpt.ilike.%${q}%`);
  const { data, count, error } = await query
    .order("published_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);
  if (error) fail("posts");
  return { items: (data ?? []).map(toPost), total: count ?? 0 };
}

export async function getPostBySlug(slug: string) {
  const { data, error } = await publicClient()
    .from("blog_posts").select("*, post_tags(tags(name,slug))")
    .eq("slug", slug).eq("published", true).maybeSingle();
  if (error) fail("the post");
  return data ? { ...data, tags: tagsOf(data.post_tags) } : null;
}
