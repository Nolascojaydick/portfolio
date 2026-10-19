"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { saveSeo, type SeoState } from "@/lib/admin/seo-actions";

const input = "mt-1.5 w-full rounded-control border border-line bg-surface px-3 py-2.5 text-sm";

export function SeoForm({ title, description }: { title: string; description: string }) {
  const [state, action, pending] = useActionState<SeoState, FormData>(saveSeo, {});
  return (
    <form action={action} className="max-w-2xl space-y-5">
      <div>
        <label htmlFor="site_title" className="text-sm font-medium">Website title</label>
        <input id="site_title" name="site_title" defaultValue={title} maxLength={70} className={input} />
        <p className="mt-1 text-xs text-muted">Shown in browser tabs and search results. Leave blank to use your name and title.</p>
      </div>
      <div>
        <label htmlFor="site_description" className="text-sm font-medium">Website description</label>
        <textarea id="site_description" name="site_description" defaultValue={description} maxLength={200} rows={3} className={input} />
      </div>
      {state.error && <p role="alert" className="text-sm text-danger">{state.error}</p>}
      {state.ok && <p role="status" className="text-sm text-ok">Saved.</p>}
      <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save SEO settings"}</Button>
    </form>
  );
}
