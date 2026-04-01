import Link from "next/link"
import { cn, formatDate } from "@/lib/utils"
import type { Post } from "@/lib/posts"

interface RelatedPostsProps {
  posts: Post[]
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null

  return (
    <section className="max-w-[720px] mx-auto mt-16">
      <h2 className="font-mono text-xs tracking-[0.2em] text-[var(--wisp-text-disabled)] uppercase mb-6">
        Related Posts
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/posts/${post.slug}`}
            className="group block rounded-xl border border-white/[0.08] bg-[rgba(10,10,10,0.6)] p-5 transition-all duration-300 hover:border-[rgba(0,212,255,0.2)] hover:bg-[rgba(10,10,10,0.9)] hover:-translate-y-1"
          >
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className="tag">{post.tags[0]}</span>
              </div>
            )}
            <h3
              className={cn(
                "text-sm font-bold text-white leading-snug mb-2",
                "group-hover:text-[var(--wisp-teal)] transition-colors duration-300"
              )}
              style={{ fontFamily: "var(--font-display)" }}
            >
              {post.title}
            </h3>
            <div className="flex items-center gap-2 font-mono text-xs tracking-wider text-[var(--wisp-text-disabled)]">
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span className="text-white/20">—</span>
              <span>{post.readingTime}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

