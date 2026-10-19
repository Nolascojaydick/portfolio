import type { Metadata } from "next";
import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";
import { EducationList, CertificationList } from "@/components/portfolio/lists";
import { getProfile, getEducation, getCertifications } from "@/lib/data";
import { safeUrl } from "@/lib/utils";

export const metadata: Metadata = { title: "About" };

export default async function AboutPage() {
  const [p, edu, certs] = await Promise.all([getProfile(), getEducation(), getCertifications()]);
  const links = [["GitHub", p.github_url], ["LinkedIn", p.linkedin_url], ["Website", p.website_url]]
    .filter(([, u]) => safeUrl(u)) as [string, string][];
  // Phase 6 serves the private résumé through a signed URL; until then only a public https link is shown.
  const resume = p.resume_url ? "/resume" : null; // signed download link

  return (
    <div className="space-y-16">
      <section className="flex flex-col gap-8 md:flex-row md:items-start">
        {p.avatar_url && (
          <Image src={p.avatar_url} alt={`Photo of ${p.display_name}`} width={224} height={224}
            className="size-44 rounded-card border border-line object-cover md:size-56" />
        )}
        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold sm:text-4xl">{p.display_name}</h1>
          <p className="mt-1 text-muted">{p.professional_title}{p.location ? `, ${p.location}` : ""}</p>
          <p className="mt-6 whitespace-pre-line leading-relaxed">{p.biography}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {resume && <ButtonLink href={resume}>Download résumé</ButtonLink>}
            {links.map(([label, url]) => <ButtonLink key={label} href={url} variant="secondary">{label}</ButtonLink>)}
          </div>
        </div>
      </section>
      {edu.length > 0 && <section><h2 className="mb-6 text-2xl font-semibold">Education</h2><EducationList items={edu} /></section>}
      {certs.length > 0 && <section><h2 className="mb-6 text-2xl font-semibold">Certifications</h2><CertificationList items={certs} /></section>}
    </div>
  );
}
