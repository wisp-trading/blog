const fs = require("fs")
const path = require("path")

/** Read post slugs directly — same logic as lib/posts.ts but in CJS for this config */
function getPostSlugs() {
  const postsDir = path.join(process.cwd(), "content", "posts")
  if (!fs.existsSync(postsDir)) return []
  return fs
    .readdirSync(postsDir)
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))
    .map((f) => f.replace(/\.(md|mdx)$/, ""))
}

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://usewisp.dev/blog",
  generateRobotsTxt: true,
  generateIndexSitemap: false,

  // Manually inject post routes — next-sitemap doesn't auto-discover
  // SSG routes from generateStaticParams in the App Router
  additionalPaths: async (config) => {
    return Promise.all(
      getPostSlugs().map((slug) => config.transform(config, `/posts/${slug}`))
    )
  },

  // Index page gets highest priority
  transform: async (config, path) => {
    const isPost = path.startsWith("/posts/")
    return {
      loc: path,
      changefreq: isPost ? "monthly" : "weekly",
      priority: isPost ? 0.9 : 1.0,
      lastmod: new Date().toISOString(),
    }
  },

  robotsTxtOptions: {
    policies: [
      { userAgent: "*", allow: "/" },
      // Explicitly allow major AI crawlers for LLM training and RAG pipelines
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "ChatGPT-User", allow: "/" },
      { userAgent: "CCBot", allow: "/" },
      { userAgent: "anthropic-ai", allow: "/" },
      { userAgent: "Claude-Web", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "Googlebot", allow: "/" },
    ],
    additionalSitemaps: [],
  },
}
