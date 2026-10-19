import type { Metadata } from "next";
import { EmptyState } from "@/components/ui/states";
import { SkillBadge } from "@/components/portfolio/skill-badge";
import { getSkills } from "@/lib/data";

export const metadata: Metadata = { title: "Skills" };

const ORDER = ["Frontend development", "Backend development", "Databases", "DevOps and deployment", "Tools and technologies"];

export default async function SkillsPage() {
  const skills = await getSkills();
  const groups = new Map<string, typeof skills>();
  skills.forEach((s) => groups.set(s.category, [...(groups.get(s.category) ?? []), s]));
  const names = [...groups.keys()].sort((a, b) => {
    const ia = ORDER.indexOf(a), ib = ORDER.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.localeCompare(b);
  });

  return (
    <>
      <h1 className="text-3xl font-semibold sm:text-4xl">Skills</h1>
      {names.length === 0 ? (
        <div className="mt-8"><EmptyState title="No skills added yet" hint="Skills you add in the admin will appear here." /></div>
      ) : (
        <div className="mt-10 space-y-10">
          {names.map((c) => (
            <section key={c}>
              <h2 className="mb-3 text-xl font-semibold">{c}</h2>
              <div className="flex flex-wrap gap-2">{groups.get(c)!.map((s) => <SkillBadge key={s.id} name={s.name} />)}</div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
