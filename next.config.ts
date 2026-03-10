import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Add /blog prefix to all routes when accessed through usewisp.dev/blog
  basePath: process.env.NODE_ENV === "production" ? "/blog" : undefined,

  // Load assets from blog subdomain so they work when proxied through usewisp.dev/blog
  assetPrefix: process.env.NODE_ENV === "production" ? "https://blog.usewisp.dev" : undefined,

  // Allow .md and .mdx files to be used as Next.js pages (forward-compatible)
  pageExtensions: ["ts", "tsx", "md", "mdx"],
}

export default nextConfig
