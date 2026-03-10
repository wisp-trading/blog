import Link from "next/link"
import { cn, formatDate } from "@/lib/utils"

export interface Post {
  slug: string
  title: string
  excerpt: string
  date: string
  readingTime: string
  tags: string[]
  author?: string
  featured?: boolean
}

interface PostCardProps {
  post: Post
  featured?: boolean
  className?: string
}

export function PostCard({ post, featured = false, className }: PostCardProps) {
  return (
    <Link href={`/posts/${post.slug}`} className="group block">
      <article
        className={cn(
          "relative rounded-xl border transition-all duration-500",
          "bg-[rgba(10,10,10,0.6)] border-white/[0.08]",
          "hover:border-[rgba(0,212,255,0.2)] hover:bg-[rgba(10,10,10,0.9)]",
          "hover:-translate-y-1",
          featured ? "p-8 md:p-10" : "p-6",
          className
        )}
      >
        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h2
          className={cn(
            "font-display text-white font-bold tracking-tight leading-tight mb-3",
            "group-hover:text-[var(--wisp-teal)] transition-colors duration-300",
            featured ? "text-3xl md:text-4xl" : "text-xl md:text-2xl"
          )}
          style={{ fontFamily: "var(--font-display)" }}
        >
          {post.title}
        </h2>

        {/* Excerpt */}
        <p
          className={cn(
            "text-[var(--wisp-text-muted)] leading-relaxed mb-5",
            featured ? "text-base" : "text-sm"
          )}
        >
          {post.excerpt}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 font-mono text-xs tracking-wider text-[var(--wisp-text-disabled)]">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span className="text-white/20">—</span>
            <span>{post.readingTime}</span>
            {post.author && (
              <>
                <span className="text-white/20">—</span>
                <span>{post.author}</span>
              </>
            )}
          </div>

          {/* Read arrow */}
          <span
            className="font-mono text-xs tracking-wider text-[var(--wisp-text-disabled)] group-hover:text-[var(--wisp-teal)] transition-colors duration-300"
            aria-hidden
          >
            READ →
          </span>
        </div>

        {/* Featured accent line */}
        {featured && (
          <div
            className="absolute top-0 left-0 right-0 h-px rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background:
                "linear-gradient(90deg, transparent, var(--wisp-teal), transparent)",
            }}
          />
        )}
      </article>
    </Link>
  )
}
