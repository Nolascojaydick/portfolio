"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { ImageField } from "./image-field";
import { ResumeField } from "./resume-field";
import { saveResource, type FormState } from "@/lib/admin/actions";
import type { Field } from "@/lib/admin/resources";

const input = "mt-1.5 w-full rounded-control border border-line bg-surface px-3 py-2.5 text-sm";

export function ResourceForm({
  resourceKey, id, fields, values, tags, tagsLabel, cancelHref,
}: {
  resourceKey: string; id: string | null; fields: Field[];
  values?: Record<string, any>; tags?: string; tagsLabel?: string; cancelHref?: string;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    saveResource.bind(null, resourceKey, id), {},
  );
  const err = (n: string) => state.fieldErrors?.[n];

  return (
    <form action={action} className="max-w-2xl space-y-6">
      {fields.map((f) => {
        const v = values?.[f.name];
        if (f.type === "image") return <ImageField key={f.name} name={f.name} label={f.label} bucket={f.bucket!} initial={v} />;
        if (f.type === "resume") return <ResumeField key={f.name} name={f.name} label={f.label} initial={v} help={f.help} />;
        const common = { id: f.name, name: f.name, "aria-invalid": !!err(f.name) || undefined };
        return (
          <div key={f.name}>
            {f.type === "checkbox" ? (
              <label className="flex items-center gap-3 text-sm">
                <input type="checkbox" {...common} defaultChecked={!!v} className="size-4 accent-[var(--color-accent)]" />
                {f.label}
              </label>
            ) : (
              <>
                <label htmlFor={f.name} className="text-sm font-medium">
                  {f.label}{f.required && <span className="text-danger"> *</span>}
                </label>
                {f.type === "textarea" || f.type === "markdown" ? (
                  <textarea {...common} rows={f.type === "markdown" ? 14 : 4} defaultValue={v ?? ""}
                    className={`${input} ${f.type === "markdown" ? "font-mono" : ""}`} />
                ) : f.type === "select" ? (
                  <select {...common} defaultValue={v ?? ""} className={input}>
                    {!f.required && <option value="">None</option>}
                    {f.required && !v && <option value="" disabled>Choose…</option>}
                    {f.options!.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input {...common}
                    type={f.type === "number" ? "number" : f.type === "date" ? "date" : f.type === "email" ? "email" : "text"}
                    inputMode={f.type === "url" ? "url" : undefined}
                    defaultValue={f.type === "date" && v ? String(v).slice(0, 10) : (v ?? (f.type === "number" ? f.default ?? "" : ""))}
                    className={input} />
                )}
              </>
            )}
            {f.help && <p className="mt-1 text-xs text-muted">{f.help}</p>}
            {err(f.name) && <p role="alert" className="mt-1 text-sm text-danger">{err(f.name)}</p>}
          </div>
        );
      })}

      {tagsLabel && (
        <div>
          <label htmlFor="tags" className="text-sm font-medium">{tagsLabel}</label>
          <input id="tags" name="tags" defaultValue={tags ?? ""} placeholder="Next.js, Supabase, Tailwind" className={input} />
          <p className="mt-1 text-xs text-muted">Separate with commas.</p>
        </div>
      )}

      {state.error && (
        <p role="alert" className="rounded-control border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">{state.error}</p>
      )}
      {state.ok && (
        <p role="status" className="rounded-control border border-ok/40 bg-ok/10 px-3 py-2 text-sm text-ok">Saved. The public site will update within a minute.</p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save changes"}</Button>
        {cancelHref && <Link href={cancelHref} className="inline-flex items-center px-4 text-sm text-muted hover:text-text">Cancel</Link>}
      </div>
    </form>
  );
}
