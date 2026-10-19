import { notFound } from "next/navigation";
import { getResource } from "@/lib/admin/resources";
import { PageHeader } from "@/components/admin/page-header";
import { ResourceForm } from "@/components/admin/resource-form";

export default async function NewPage({ params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params;
  const r = getResource(resource);
  if (!r || r.singleton) notFound();
  return (
    <>
      <PageHeader title={`Add ${r.singular}`} />
      <ResourceForm resourceKey={r.key} id={null} fields={r.fields} tagsLabel={r.tags?.label} cancelHref={`/admin/${r.key}`} />
    </>
  );
}
