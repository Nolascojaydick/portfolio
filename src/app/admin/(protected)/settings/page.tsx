import { requireAdmin } from "@/lib/auth/admin";
import { getResource } from "@/lib/admin/resources";
import { PageHeader } from "@/components/admin/page-header";
import { ResourceForm } from "@/components/admin/resource-form";
import { SeoForm } from "@/components/admin/seo-form";

export default async function SettingsPage() {
  const { supabase } = await requireAdmin();
  const r = getResource("profile")!;
  const [{ data: row }, { data: seo }] = await Promise.all([
    (supabase as any).from(r.table).select("*").limit(1).maybeSingle(),
    supabase.from("site_settings").select("value").eq("key", "public.seo").maybeSingle(),
  ]);
  const s = (seo?.value ?? {}) as { site_title?: string; site_description?: string };
  return (
    <>
      <PageHeader title="Profile settings" />
      <ResourceForm resourceKey="profile" id={row?.id ?? null} fields={r.fields} values={row ?? undefined} />
      <h2 className="mb-6 mt-16 text-xl font-semibold">Search and sharing</h2>
      <SeoForm title={s.site_title ?? ""} description={s.site_description ?? ""} />
    </>
  );
}
