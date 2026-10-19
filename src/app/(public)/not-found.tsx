import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="py-24 text-center">
      <h1 className="text-4xl font-semibold">Page not found</h1>
      <p className="mt-3 text-muted">It may have been moved, unpublished, or never existed.</p>
      <ButtonLink href="/" className="mt-8">Back to home</ButtonLink>
    </div>
  );
}
