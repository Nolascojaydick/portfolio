import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/reveal";
import { formatDate } from "@/lib/utils";
import type { PostCard } from "@/lib/data";

export function BlogCard({ post }: { post: PostCard }) {
  return (
    <Reveal className="h-full">
    <Link
      href={`/blog/${post.slug}`}
      className="block h-full overflow-hidden rounded-card border border-line bg-surface transition hover:-translate-y-1 hover:border-accent-soft hover:shadow-lg motion-reduce:hover:translate-y-0"
    >
      {post.cover_image_url && (
        <div className="relative aspect-[16/9] bg-raised">
          <Image src={post.cover_image_url} alt="" fill sizes="(min-width:1024px) 33vw, 100vw" className="object-cover" />
        </div>
      )}
      <div className="p-5">
        <p className="text-xs text-muted">{formatDate(post.published_at, { year: "numeric", month: "long", day: "numeric" })}</p>
        <h3 className="mt-1 text-lg font-semibold">{post.title}</h3>
        <p className="mt-1 line-clamp-3 text-sm text-muted">{post.excerpt}</p>
      </div>
    </Link>
    </Reveal>
  );
}
