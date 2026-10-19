"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { addGalleryImage, type GalleryState } from "@/lib/admin/upload-actions";

export function GalleryForm({ projectId }: { projectId: string }) {
  const [state, action, pending] = useActionState<GalleryState, FormData>(addGalleryImage.bind(null, projectId), {});
  return (
    <form action={action} className="mt-6 flex flex-wrap items-end gap-3">
      <div>
        <label htmlFor="gallery-file" className="text-sm font-medium">Image</label>
        <input id="gallery-file" name="file" type="file" required accept="image/jpeg,image/png,image/webp,image/avif" className="mt-1.5 block text-sm" />
      </div>
      <div className="min-w-48 flex-1">
        <label htmlFor="alt_text" className="text-sm font-medium">Description for screen readers</label>
        <input id="alt_text" name="alt_text" maxLength={200} className="mt-1.5 w-full rounded-control border border-line bg-surface px-3 py-2.5 text-sm" />
      </div>
      <Button type="submit" disabled={pending}>{pending ? "Uploading…" : "Add to gallery"}</Button>
      {state.error && <p role="alert" className="w-full text-sm text-danger">{state.error}</p>}
      {state.ok && <p role="status" className="w-full text-sm text-ok">Image added.</p>}
    </form>
  );
}
