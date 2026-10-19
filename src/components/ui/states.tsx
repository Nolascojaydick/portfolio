import { ButtonLink } from "./button";

export function EmptyState({
  title, hint, href, cta,
}: { title: string; hint: string; href?: string; cta?: string }) {
  return (
    <div className="rounded-card border border-dashed border-line p-10 text-center">
      <p className="font-medium">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted">{hint}</p>
      {href && cta && <ButtonLink href={href} variant="secondary" className="mt-5">{cta}</ButtonLink>}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div role="alert" className="rounded-card border border-danger/40 bg-danger/10 p-6 text-sm">
      <p className="font-medium text-danger">Something went wrong</p>
      <p className="mt-1 text-muted">{message}</p>
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-control bg-raised ${className}`} aria-hidden />;
}
