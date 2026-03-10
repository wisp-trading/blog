import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  basePath: "/blog",
  // Allow .md and .mdx files to be used as Next.js pages (forward-compatible)
  pageExtensions: ["ts", "tsx", "md", "mdx"],
}

export default nextConfig
