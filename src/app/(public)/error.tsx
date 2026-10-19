"use client";
import { ErrorState } from "@/components/ui/states";
import { Button } from "@/components/ui/button";

export default function PublicError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="space-y-4">
      <ErrorState message={error.message || "Please try again in a moment."} />
      <Button variant="secondary" onClick={reset}>Try again</Button>
    </div>
  );
}
