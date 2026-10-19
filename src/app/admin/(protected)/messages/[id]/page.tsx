import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { setRead, setArchived, deleteMessage } from "@/lib/admin/message-actions";
import { PageHeader } from "@/components/admin/page-header";
import { DeleteButton } from "@/components/admin/delete-button";
import { Button, ButtonLink } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export default async function MessagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();
  const { supabase } = await requireAdmin();
  const { data: m } = await supabase.from("contact_messages").select("*").eq("id", id).maybeSingle();
  if (!m) notFound();

  return (
    <>
      <PageHeader title={m.subject} />
      <Link href="/admin/messages" className="text-sm text-muted hover:text-text">Back to messages</Link>
      <dl className="mt-6 grid max-w-2xl gap-1 text-sm">
        <div className="flex gap-2"><dt className="text-muted">From</dt><dd>{m.sender_name} ({m.sender_email})</dd></div>
        <div className="flex gap-2"><dt className="text-muted">Received</dt><dd>{formatDate(m.created_at, { year: "numeric", month: "long", day: "numeric" })}</dd></div>
      </dl>
      {/* Plain text only: React escapes the content, so submitted HTML is never executed. */}
      <p className="mt-6 max-w-2xl whitespace-pre-wrap rounded-card border border-line bg-surface p-5">{m.message}</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <ButtonLink href={`mailto:${m.sender_email}?subject=${encodeURIComponent(`Re: ${m.subject}`)}`}>Reply by email</ButtonLink>
        <form action={setRead.bind(null, m.id, !m.is_read)}>
          <Button type="submit" variant="secondary">{m.is_read ? "Mark as unread" : "Mark as read"}</Button>
        </form>
        <form action={setArchived.bind(null, m.id, !m.archived_at)}>
          <Button type="submit" variant="secondary">{m.archived_at ? "Move to inbox" : "Archive"}</Button>
        </form>
        <DeleteButton action={deleteMessage.bind(null, m.id)} label={m.subject} />
      </div>
    </>
  );
}
