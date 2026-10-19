"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { uploadImage } from "@/lib/admin/upload-actions";

export function ImageField({ name, label, bucket, initial }: { name: string; label: string; bucket: string; initial?: string | null }) {
  const [url, setUrl] = useState(initial ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true); setError(undefined);
    const fd = new FormData();
    fd.set("file", file);
    const res = await uploadImage(bucket, fd);
    setBusy(false);
    if (res.error) setError(res.error); else setUrl(res.url ?? "");
  }

  return (
    <div>
      <p className="text-sm font-medium">{label}</p>
      <input type="hidden" name={name} value={url} />
      {url && <img src={url} alt="" className="mt-2 h-32 rounded-control border border-line object-cover" />}
      <div className="mt-2 flex items-center gap-3">
        <label className="cursor-pointer rounded-control border border-line bg-surface px-4 py-2.5 text-sm hover:bg-raised has-[:disabled]:opacity-50">
          {busy ? "Uploading…" : url ? "Replace image" : "Upload image"}
          <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={onPick} disabled={busy} className="sr-only" />
        </label>
        {url && <Button type="button" variant="ghost" onClick={() => setUrl("")}>Remove</Button>}
      </div>
      {error && <p role="alert" className="mt-1 text-sm text-danger">{error}</p>}
    </div>
  );
}
