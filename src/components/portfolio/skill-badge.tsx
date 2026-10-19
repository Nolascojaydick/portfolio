export function SkillBadge({ name }: { name: string }) {
  return (
    <span className="inline-block rounded-full transition hover:-translate-y-0.5 hover:bg-line border border-line bg-raised px-3 py-1 text-sm text-text">
      {name}
    </span>
  );
}
