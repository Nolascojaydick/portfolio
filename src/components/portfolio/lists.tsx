import { formatDate } from "@/lib/utils";
import { safeUrl } from "@/lib/utils";

export function ExperienceList({ items }: { items: any[] }) {
  return (
    <ol className="space-y-8 border-l border-line pl-6">
      {items.map((e) => (
        <li key={e.id}>
          <h3 className="text-lg font-semibold">{e.job_title}, {e.company}</h3>
          <p className="text-sm text-muted">
            {formatDate(e.start_date)} to {e.is_current ? "present" : formatDate(e.end_date)}
            {e.employment_type ? `, ${e.employment_type}` : ""}
          </p>
          {e.description && <p className="mt-2 max-w-2xl text-muted">{e.description}</p>}
        </li>
      ))}
    </ol>
  );
}

export function EducationList({ items }: { items: any[] }) {
  return (
    <ul className="space-y-5">
      {items.map((e) => (
        <li key={e.id}>
          <h3 className="font-semibold">{e.degree}{e.field_of_study ? `, ${e.field_of_study}` : ""}</h3>
          <p className="text-sm text-muted">
            {e.institution}
            {e.start_date || e.end_date ? `, ${formatDate(e.start_date)} to ${formatDate(e.end_date)}` : ""}
          </p>
          {e.description && <p className="mt-1 max-w-2xl text-sm text-muted">{e.description}</p>}
        </li>
      ))}
    </ul>
  );
}

export function CertificationList({ items }: { items: any[] }) {
  return (
    <ul className="space-y-4">
      {items.map((c) => {
        const url = safeUrl(c.credential_url);
        return (
          <li key={c.id}>
            <h3 className="font-semibold">{c.name}</h3>
            <p className="text-sm text-muted">
              {c.issuing_organization}{c.issue_date ? `, ${formatDate(c.issue_date)}` : ""}
              {url && <> · <a href={url} target="_blank" rel="noopener noreferrer" className="text-accent underline">View credential</a></>}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
