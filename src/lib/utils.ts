import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const formatDate = (iso: string | null, opts?: Intl.DateTimeFormatOptions) =>
  iso
    ? new Date(iso).toLocaleDateString("en", opts ?? { year: "numeric", month: "short" })
    : "";

// Only render http(s) links that came from the database.
export const safeUrl = (u?: string | null) => (u && /^https?:\/\//i.test(u) ? u : null);
