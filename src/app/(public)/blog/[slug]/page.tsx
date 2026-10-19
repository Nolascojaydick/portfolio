import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/ui/markdown";
import { SectionHeading } from "@/components/ui/section-heading";
import { SkillBadge } from "@/components/portfolio/skill-badge";
import { BlogCard } from "@/components/portfolio/post-card";
import { getPostBySlug, getPosts } from "@/lib/data";
import { formatDate } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      type: "article", title: post.title, description: post.excerpt,
      publishedTime: post.published_at ?? undefined,
      images: post.cover_image_url ? [post.cover_image_url] : [],
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();
  const more = (await getPosts({ limit: 4 })).items.filter((x) => x.slug !== post.slug).slice(0, 3);

  return (
    <article>
      <header className="max-w-3xl">
        <p className="text-sm text-muted">{formatDate(post.published_at, { year: "numeric", month: "long", day: "numeric" })}</p>
        <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">{post.title}</h1>
        {post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">{post.tags.map((t: any) => <SkillBadge key={t.slug} name={t.name} />)}</div>
        )}
      </header>
      {post.cover_image_url && (
        <div className="relative my-10 aspect-[16/9] overflow-hidden rounded-card border border-line bg-raised">
          <Image src={post.cover_image_url} alt="" fill priority sizes="(min-width:1152px) 1152px, 100vw" className="object-cover" />
        </div>
      )}
      <div className="mt-10"><Markdown>{post.content}</Markdown></div>
      {more.length > 0 && (
        <section className="mt-20">
          <SectionHeading title="More posts" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{more.map((x) => <BlogCard key={x.slug} post={x} />)}</div>
        </section>
      )}
    </article>
  );
}
