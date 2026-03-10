import type { MetadataRoute } from "next"
import { getPostSlugs } from "@/lib/posts"

const SITE_URL = "https://blog.usewisp.dev"

export default function sitemap(): MetadataRoute.Sitemap {
  const postSlugs = getPostSlugs()

  const postEntries: MetadataRoute.Sitemap = postSlugs.map((slug) => ({
    url: `${SITE_URL}/posts/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.9,
  }))

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...postEntries,
  ]
}
