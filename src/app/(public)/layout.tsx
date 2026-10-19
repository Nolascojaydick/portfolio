import { PublicShell } from "@/components/layout/public-shell";

export const revalidate = 60;

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <PublicShell>{children}</PublicShell>;
}
