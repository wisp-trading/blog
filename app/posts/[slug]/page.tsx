import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { MDXRemote } from "next-mdx-remote/rsc"
import rehypePrettyCode from "rehype-pretty-code"
import remarkGfm from "remark-gfm"
import { getPost, getPostSlugs } from "@/lib/posts"
import { formatDate } from "@/lib/utils"

const mdxOptions = {
  mdxOptions: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      [
        rehypePrettyCode,
        {
          // Dark theme that matches the Wisp aesthetic
          theme: "github-dark-dimmed",
          keepBackground: false, // We control the bg via CSS
        },
      ],
    ],
  },
}

const SITE_URL = "https://usewisp.dev/blog"

// ── Types ─────────────────────────────────────────────────────────────────────

interface PostPageProps {
  params: Promise<{ slug: string }>
}

// ── Static generation ─────────────────────────────────────────────────────────
// Tells Vercel to pre-render a page for every .md/.mdx file at build time.

export async function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }))
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params
  try {
    const post = getPost(slug)
    const url = `${SITE_URL}/posts/${slug}`
    return {
      title: post.title,
      description: post.excerpt,
      authors: post.author ? [{ name: post.author }] : undefined,
      alternates: { canonical: url },
      openGraph: {
        title: post.title,
        description: post.excerpt,
        url,
        type: "article",
        publishedTime: post.date,
        authors: post.author ? [post.author] : undefined,
        tags: post.tags,
        siteName: "Wisp Blog",
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: post.excerpt,
      },
    }
  } catch {
    return {}
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params

  let post
  try {
    post = getPost(slug)
  } catch {
    notFound()
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Organization",
      name: post.author ?? "Wisp Team",
      url: "https://usewisp.dev",
    },
    publisher: {
      "@type": "Organization",
      name: "Wisp",
      url: "https://usewisp.dev",
      logo: {
        "@type": "ImageObject",
        url: "https://usewisp.dev/logo-transparent.svg",
      },
    },
    url: `${SITE_URL}/posts/${post.slug}`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/posts/${post.slug}`,
    },
    keywords: post.tags.join(", "),
    inLanguage: "en-US",
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <main className="relative z-10 min-h-screen pt-32 pb-16 px-6 md:px-12">
        <div className="max-w-[1200px] mx-auto">

          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-xs tracking-wider text-[var(--wisp-text-disabled)] hover:text-[var(--wisp-teal)] transition-colors duration-300 mb-12"
          >
            ← ALL POSTS
          </Link>

          {/* Article header */}
          <header className="max-w-[720px] mx-auto mb-12">
            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h1
              className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight mb-6"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {post.title}
            </h1>

            {/* Excerpt */}
            <p className="text-[var(--wisp-text-muted)] text-lg leading-relaxed mb-8">
              {post.excerpt}
            </p>

            {/* Meta row */}
            <div className="flex items-center gap-4 font-mono text-xs tracking-wider text-[var(--wisp-text-disabled)] pb-8 border-b border-white/10">
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
          </header>

          {/* Article body */}
          <article className="prose mx-auto">
            <MDXRemote source={post.content} options={mdxOptions as any} />
          </article>

          {/* Post footer */}
          <div className="max-w-[720px] mx-auto mt-16 pt-8 border-t border-white/10">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="inline-flex items-center gap-2 font-mono text-xs tracking-wider text-[var(--wisp-text-disabled)] hover:text-[var(--wisp-teal)] transition-colors duration-300"
              >
                ← MORE POSTS
              </Link>
              <Link
                href="https://github.com/wisp-trading/wisp"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-mono text-xs tracking-wider text-[var(--wisp-text-disabled)] hover:text-[var(--wisp-teal)] transition-colors duration-300"
              >
                STAR ON GITHUB →
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
