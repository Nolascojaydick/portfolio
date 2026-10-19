import { notFound } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { getResource } from "@/lib/admin/resources";
import { deleteGalleryImage } from "@/lib/admin/upload-actions";
import { PageHeader } from "@/components/admin/page-header";
import { ResourceForm } from "@/components/admin/resource-form";
import { GalleryForm } from "@/components/admin/gallery-form";
import { DeleteButton } from "@/components/admin/delete-button";

export default async function EditPage({ params }: { params: Promise<{ resource: string; id: string }> }) {
  const { resource, id } = await params;
  const r = getResource(resource);
  if (!r || r.singleton || !z.string().uuid().safeParse(id).success) notFound();
  const { supabase } = await requireAdmin();
  const db = supabase as any;

  const { data: row } = await db.from(r.table).select("*").eq("id", id).maybeSingle();
  if (!row) notFound();

  let tags = "";
  if (r.tags) {
    const { data } = await db.from(r.tags.junction).select("tags(name)").eq(r.tags.fk, id);
    tags = (data ?? []).map((x: any) => x.tags?.name).filter(Boolean).join(", ");
  }
  const gallery = r.key === "projects"
    ? (await db.from("project_images").select("*").eq("project_id", id).order("display_order")).data ?? []
    : null;

  return (
    <>
      <PageHeader title={`Edit ${r.singular}`} />
      <ResourceForm resourceKey={r.key} id={id} fields={r.fields} values={row} tags={tags}
        tagsLabel={r.tags?.label} cancelHref={`/admin/${r.key}`} />

      {gallery && (
        <section className="mt-16 max-w-2xl">
          <h2 className="text-xl font-semibold">Gallery</h2>
          {gallery.length === 0 ? (
            <p className="mt-2 text-sm text-muted">No extra screenshots yet.</p>
          ) : (
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {gallery.map((img: any) => (
                <li key={img.id} className="space-y-2 rounded-card border border-line p-3">
                  <img src={img.image_url} alt={img.alt_text} className="aspect-[16/10] w-full rounded-control object-cover" />
                  <p className="truncate text-xs text-muted">{img.alt_text || "No description"}</p>
                  <DeleteButton action={deleteGalleryImage.bind(null, img.id)} label={img.alt_text || "this image"} />
                </li>
              ))}
            </ul>
          )}
          <GalleryForm projectId={id} />
        </section>
      )}
    </>
  );
}
