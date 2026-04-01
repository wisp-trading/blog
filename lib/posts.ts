import fs from "fs"
import path from "path"
import matter from "gray-matter"

// ── Types ────────────────────────────────────────────────────────────────────

export interface PostFrontmatter {
  title: string
  excerpt: string
  date: string        // "YYYY-MM-DD" — ISO date string, sorts lexicographically
  readingTime: string // e.g. "8 min read" — set by author in frontmatter
  tags: string[]
  author?: string
  featured?: boolean
}

export interface Post extends PostFrontmatter {
  slug: string
}

export interface PostWithContent extends Post {
  content: string // Raw markdown/MDX body below the --- fence
}

// ── Config ───────────────────────────────────────────────────────────────────

const POSTS_DIR = path.join(process.cwd(), "content", "posts")

// ── Helpers ──────────────────────────────────────────────────────────────────

function slugFromFilename(filename: string): string {
  return filename.replace(/\.(md|mdx)$/, "")
}

function parsePostMeta(filename: string): Post {
  const filepath = path.join(POSTS_DIR, filename)
  const raw = fs.readFileSync(filepath, "utf-8")
  const { data } = matter(raw)
  const fm = data as PostFrontmatter

  return {
    slug: slugFromFilename(filename),
    title: fm.title,
    excerpt: fm.excerpt,
    date: fm.date,
    readingTime: fm.readingTime,
    tags: fm.tags ?? [],
    author: fm.author,
    featured: fm.featured,
  }
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns all posts sorted newest-first.
 * Called from app/page.tsx (blog index).
 */
export function getPosts(): Post[] {
  if (!fs.existsSync(POSTS_DIR)) return []

  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))
    .map(parsePostMeta)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

/**
 * Returns a single post's frontmatter + raw content string.
 * Called from app/posts/[slug]/page.tsx.
 * Throws if no file matches the slug.
 */
export function getPost(slug: string): PostWithContent {
  // Try .mdx first so authors can upgrade .md → .mdx without changing the slug
  for (const ext of [".mdx", ".md"]) {
    const filepath = path.join(POSTS_DIR, `${slug}${ext}`)
    if (fs.existsSync(filepath)) {
      const raw = fs.readFileSync(filepath, "utf-8")
      const { data, content } = matter(raw)
      const fm = data as PostFrontmatter

      return {
        slug,
        title: fm.title,
        excerpt: fm.excerpt,
        date: fm.date,
        readingTime: fm.readingTime,
        tags: fm.tags ?? [],
        author: fm.author,
        featured: fm.featured,
        content,
      }
    }
  }

  throw new Error(`Post not found: ${slug}`)
}

/**
 * Returns up to `limit` posts that share the most tags with the given slug.
 * The source post itself is excluded.
 */
export function getRelatedPosts(slug: string, limit = 3): Post[] {
  const all = getPosts()
  const source = all.find((p) => p.slug === slug)
  if (!source) return all.filter((p) => p.slug !== slug).slice(0, limit)

  return all
    .filter((p) => p.slug !== slug)
    .map((p) => ({
      post: p,
      score: p.tags.filter((t) => source.tags.includes(t)).length,
    }))
    .sort((a, b) => b.score - a.score || (a.post.date < b.post.date ? 1 : -1))
    .slice(0, limit)
    .map(({ post }) => post)
}
export function getPostSlugs(): string[] {
  if (!fs.existsSync(POSTS_DIR)) return []

  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))
    .map(slugFromFilename)
}
