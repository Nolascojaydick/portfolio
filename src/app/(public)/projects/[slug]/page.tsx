import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";
import { Markdown } from "@/components/ui/markdown";
import { SectionHeading } from "@/components/ui/section-heading";
import { SkillBadge } from "@/components/portfolio/skill-badge";
import { ProjectCard } from "@/components/portfolio/project-card";
import { getProjectBySlug, getProjects } from "@/lib/data";
import { safeUrl } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProjectBySlug(slug);
  if (!p) return {}; // unpublished or missing: no metadata leaks
  return {
    title: p.title,
    description: p.short_description,
    openGraph: { title: p.title, description: p.short_description, images: p.cover_image_url ? [p.cover_image_url] : [] },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const p = await getProjectBySlug(slug);
  if (!p) notFound();

  const related = p.category
    ? (await getProjects({ category: p.category, limit: 4 })).items.filter((x) => x.slug !== p.slug).slice(0, 3)
    : [];
  const repo = safeUrl(p.repository_url);
  const demo = safeUrl(p.live_demo_url);

  return (
    <article className="space-y-12">
      <header className="max-w-3xl">
        <h1 className="text-4xl font-semibold sm:text-5xl">{p.title}</h1>
        <p className="mt-4 text-lg text-muted">{p.short_description}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {demo && <ButtonLink href={demo}>Live demo</ButtonLink>}
          {repo && <ButtonLink href={repo} variant="secondary">GitHub repository</ButtonLink>}
        </div>
      </header>

      {p.cover_image_url && (
        <div className="relative aspect-[16/9] overflow-hidden rounded-card border border-line bg-raised">
          <Image src={p.cover_image_url} alt={`${p.title} cover`} fill priority sizes="(min-width:1152px) 1152px, 100vw" className="object-cover" />
        </div>
      )}

      {p.tags.length > 0 && (
        <section aria-label="Technologies used">
          <h2 className="mb-3 text-lg font-semibold">Built with</h2>
          <div className="flex flex-wrap gap-2">{p.tags.map((t: any) => <SkillBadge key={t.slug} name={t.name} />)}</div>
        </section>
      )}

      {p.description && <Markdown>{p.description}</Markdown>}

      {p.images.length > 0 && (
        <section aria-label="Screenshots">
          <h2 className="mb-4 text-lg font-semibold">Screenshots</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {p.images.map((img: any) => (
              <div key={img.id} className="relative aspect-[16/10] overflow-hidden rounded-card border border-line bg-raised">
                <Image src={img.image_url} alt={img.alt_text || ""} fill sizes="(min-width:640px) 50vw, 100vw" className="object-cover" />
              </div>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section>
          <SectionHeading title="Related projects" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((x) => <ProjectCard key={x.slug} project={x} />)}
          </div>
        </section>
      )}
    </article>
  );
}
