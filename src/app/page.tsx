import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { SectionHeading } from "@/components/ui/section-heading";
import { profileFallback as p } from "@/lib/profile-fallback";

export default function Home() {
  return (
    <>
      <section className="py-16">
        <h1 className="max-w-3xl text-4xl font-semibold sm:text-6xl">{p.biography}</h1>
        <p className="mt-6 max-w-xl text-lg text-muted">
          {p.display_name}, {p.professional_title.toLowerCase()}.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/projects">View my projects</ButtonLink>
          <ButtonLink href="/contact" variant="secondary">Contact me</ButtonLink>
        </div>
      </section>
      <section className="py-12">
        <SectionHeading title="Featured projects" />
        <EmptyState
          title="No projects published yet"
          hint="Featured projects appear here once Phase 4 connects this page to Supabase."
        />
      </section>
    </>
  );
}
