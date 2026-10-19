"use client";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "./submit-button";

export function DeleteButton({ action, label }: { action: () => Promise<void>; label: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <>
      <Button type="button" variant="danger" onClick={() => ref.current?.showModal()}>Delete</Button>
      <dialog ref={ref} className="m-auto w-full max-w-sm rounded-card border border-line bg-surface p-6 text-text backdrop:bg-black/60">
        <h2 className="text-lg font-semibold">Delete this item?</h2>
        <p className="mt-2 text-sm text-muted">“{label}” will be permanently deleted. This can't be undone.</p>
        <form action={action} className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => ref.current?.close()}>Cancel</Button>
          <SubmitButton variant="danger" pendingLabel="Deleting…">Delete</SubmitButton>
        </form>
      </dialog>
    </>
  );
}
