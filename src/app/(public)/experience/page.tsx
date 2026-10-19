import type { Metadata } from "next";
import { EmptyState } from "@/components/ui/states";
import { ExperienceList, EducationList, CertificationList } from "@/components/portfolio/lists";
import { getExperience, getEducation, getCertifications } from "@/lib/data";

export const metadata: Metadata = { title: "Experience" };

export default async function ExperiencePage() {
  const [exp, edu, certs] = await Promise.all([getExperience(), getEducation(), getCertifications()]);
  return (
    <div className="space-y-16">
      <section>
        <h1 className="mb-8 text-3xl font-semibold sm:text-4xl">Experience</h1>
        {exp.length ? <ExperienceList items={exp} /> : <EmptyState title="No experience added yet" hint="Entries from the admin will appear here." />}
      </section>
      {edu.length > 0 && (
        <section><h2 className="mb-6 text-2xl font-semibold">Education</h2><EducationList items={edu} /></section>
      )}
      {certs.length > 0 && (
        <section><h2 className="mb-6 text-2xl font-semibold">Certifications</h2><CertificationList items={certs} /></section>
      )}
    </div>
  );
}
