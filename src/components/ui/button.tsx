import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const button = cva(
  "inline-flex items-center justify-center gap-2 rounded-control px-4 py-2.5 text-sm font-medium transition hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 motion-reduce:hover:translate-y-0 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-accent text-white hover:bg-accent/90",
        secondary: "border border-line bg-surface text-text hover:bg-raised",
        ghost: "text-muted hover:bg-raised hover:text-text",
        danger: "bg-danger/15 text-danger hover:bg-danger/25",
      },
    },
    defaultVariants: { variant: "primary" },
  },
);

type Props = VariantProps<typeof button> & { className?: string; children: React.ReactNode };

export function Button({
  variant, className, ...rest
}: Props & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn(button({ variant }), className)} {...rest} />;
}

export function ButtonLink({ variant, className, href, children }: Props & { href: string }) {
  return (
    <Link href={href} className={cn(button({ variant }), className)}>
      {children}
    </Link>
  );
}
