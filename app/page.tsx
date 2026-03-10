import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PostCard } from "@/components/post-card"
import { getPosts } from "@/lib/posts"

export default function BlogIndexPage() {
  const posts = getPosts()

  // First post with featured: true is the hero; falls back to newest
  const featuredPost = posts.find((p) => p.featured) ?? posts[0]
  const remainingPosts = posts.filter((p) => p.slug !== featuredPost?.slug)

  return (
    <>
      <Navbar />

      <main className="relative z-10 min-h-screen pt-32 pb-16 px-6 md:px-12">
        <div className="max-w-[1200px] mx-auto">

          {/* ── Page Header ─────────────────────────────────────────────── */}
          <header className="mb-16">
            <h1
              className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight mb-6"
              style={{ fontFamily: "var(--font-display)" }}
            >
              The Wisp
              <br />
              <em>Blog</em>
            </h1>
            <p className="text-[var(--wisp-text-muted)] text-lg max-w-xl leading-relaxed">
              Insights on algorithmic trading, Go development, agentic
              strategies, and the Wisp framework.
            </p>
          </header>

          {/* ── Featured Post ───────────────────────────────────────────── */}
          {featuredPost && (
            <section className="mb-12">
              <p className="font-mono text-xs tracking-[0.2em] text-[var(--wisp-text-disabled)] uppercase mb-4">
                Featured
              </p>
              <PostCard post={featuredPost} featured />
            </section>
          )}

          {/* ── Post Grid ───────────────────────────────────────────────── */}
          {remainingPosts.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <p className="font-mono text-xs tracking-[0.2em] text-[var(--wisp-text-disabled)] uppercase">
                  Recent Posts
                </p>
                {/* Future: tag filter pills go here */}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {remainingPosts.map((post) => (
                  <PostCard key={post.slug} post={post} />
                ))}
              </div>
            </section>
          )}

          {/* ── Empty state ─────────────────────────────────────────────── */}
          {posts.length === 0 && (
            <p className="font-mono text-sm text-[var(--wisp-text-disabled)]">
              No posts yet. Drop a <code>.md</code> file into{" "}
              <code>content/posts/</code> to get started.
            </p>
          )}
        </div>
      </main>

      <Footer />
    </>
  )
}
