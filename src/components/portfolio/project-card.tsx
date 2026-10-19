import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/reveal";
import { SkillBadge } from "./skill-badge";

export type ProjectCardData = {
  slug: string; title: string; short_description: string;
  cover_image_url: string | null; tags: string[];
};

export function ProjectCard({ project }: { project: ProjectCardData }) {
  return (
    <Reveal className="h-full">
    <Link
      href={`/projects/${project.slug}`}
      className="group block h-full overflow-hidden rounded-card border border-line bg-surface transition hover:-translate-y-1 hover:border-accent-soft hover:shadow-lg motion-reduce:hover:translate-y-0"
    >
      <div className="relative aspect-[16/10] bg-raised">
        {project.cover_image_url && (
          <Image
            src={project.cover_image_url} alt=""
            fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
            className="object-cover"
          />
        )}
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold">{project.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted">{project.short_description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {project.tags.slice(0, 4).map((t) => <SkillBadge key={t} name={t} />)}
        </div>
      </div>
    </Link>
    </Reveal>
  );
}
