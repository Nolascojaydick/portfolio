"use client";

import { useState } from "react";
import { uploadResume } from "@/lib/admin/upload-actions";

export function ResumeField({ name, label, initial, help }: { name: string; label: string; initial?: string | null; help?: string }) {
  const [path, setPath] = useState(initial ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true); setError(undefined);
    const fd = new FormData();
    fd.set("file", file);
    const res = await uploadResume(fd);
    setBusy(false);
    if (res.error) setError(res.error); else setPath(res.path ?? "");
  }

  return (
    <div>
      <p className="text-sm font-medium">{label}</p>
      <input type="hidden" name={name} value={path} />
      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
        <label className="cursor-pointer rounded-control border border-line bg-surface px-4 py-2.5 hover:bg-raised has-[:disabled]:opacity-50">
          {busy ? "Uploading…" : path ? "Replace PDF" : "Upload PDF"}
          <input type="file" accept="application/pdf" onChange={onPick} disabled={busy} className="sr-only" />
        </label>
        {path && <a href="/resume" target="_blank" className="text-accent underline">Preview download</a>}
        {path && <button type="button" onClick={() => setPath("")} className="text-muted hover:text-text">Remove</button>}
      </div>
      {help && <p className="mt-1 text-xs text-muted">{help}</p>}
      {error && <p role="alert" className="mt-1 text-sm text-danger">{error}</p>}
      <p className="mt-1 text-xs text-muted">Remember to click Save changes below after uploading.</p>
    </div>
  );
}
