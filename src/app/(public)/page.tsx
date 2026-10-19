import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProjectCard } from "@/components/portfolio/project-card";
import { BlogCard } from "@/components/portfolio/post-card";
import { SkillBadge } from "@/components/portfolio/skill-badge";
import { ExperienceList } from "@/components/portfolio/lists";
import { getProfile, getProjects, getSkills, getExperience, getPosts } from "@/lib/data";
import { safeUrl } from "@/lib/utils";

export default async function Home() {
  const [p, featured, skills, experience, posts] = await Promise.all([
    getProfile(),
    getProjects({ featured: true, limit: 3 }),
    getSkills(),
    getExperience(),
    getPosts({ limit: 3 }),
  ]);
  const social = [["GitHub", p.github_url], ["LinkedIn", p.linkedin_url]].filter(([, u]) => safeUrl(u));
  const more = "text-sm text-accent hover:underline";

  return (
    <div className="space-y-24">
      <section className="flex flex-col-reverse items-start gap-10 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="rise max-w-3xl text-4xl font-semibold sm:text-6xl">{p.biography}</h1>
          <p className="rise rise-2 mt-6 text-lg text-muted">{p.display_name}, {p.professional_title.toLowerCase()}.</p>
          <div className="rise rise-3 mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/projects">View my projects</ButtonLink>
            <ButtonLink href="/contact" variant="secondary">Contact me</ButtonLink>
          </div>
          {social.length > 0 && (
            <ul className="rise rise-4 mt-6 flex gap-5 text-sm text-muted">
              {social.map(([label, url]) => (
                <li key={label}><a href={url!} target="_blank" rel="noopener noreferrer" className="link-u hover:text-text">{label}</a></li>
              ))}
            </ul>
          )}
        </div>
        {p.avatar_url && (
          <div className="avatar-wrap rise rise-2 m-3">
            <Image src={p.avatar_url} alt={`Photo of ${p.display_name}`} width={200} height={200} priority
              className="size-40 rounded-full border border-line object-cover md:size-52" />
          </div>
        )}
      </section>

      <section>
        <Reveal delay={0}>
          <SectionHeading title="Featured projects" action={<Link href="/projects" className={more}>All projects</Link>} />
        </Reveal>
        {featured.items.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.items.map((x) => <ProjectCard key={x.slug} project={x} />)}
          </div>
        ) : (
          <EmptyState title="No featured projects yet" hint="Publish a project and mark it as featured in the admin and it will show up here." />
        )}
      </section>

      {skills.length > 0 && (
        <Reveal delay={0}>
          <SectionHeading title="Skills" action={<Link href="/skills" className={more}>See all</Link>} />
          <div className="flex flex-wrap gap-2">
            {skills.slice(0, 14).map((s) => <SkillBadge key={s.id} name={s.name} />)}
          </div>
        </Reveal>
      )}

      {experience.length > 0 && (
        <Reveal delay={0}>
          <SectionHeading title="Experience" action={<Link href="/experience" className={more}>Full timeline</Link>} />
          <ExperienceList items={experience.slice(0, 2)} />
        </Reveal>
      )}

      {posts.items.length > 0 && (
        <section>
          <Reveal delay={0}>
            <SectionHeading title="Recent writing" action={<Link href="/blog" className={more}>All posts</Link>} />
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.items.map((x) => <BlogCard key={x.slug} post={x} />)}
          </div>
        </section>
      )}

      <Reveal delay={0}>
        <section className="rounded-card bg-accent p-8 text-[#dde6ed] sm:p-12">
          <h2 className="text-2xl font-semibold sm:text-3xl">Have something in mind?</h2>
          <p className="mt-2 max-w-lg text-[#c9d6df]">Tell me about the project, the team, or the problem you're trying to solve.</p>
          <ButtonLink href="/contact" className="mt-6 bg-line text-text hover:bg-line/90">Send a message</ButtonLink>
        </section>
      </Reveal>
    </div>
  );
}
