import type React from "react"
import type { Metadata, Viewport } from "next"
import { Playfair_Display, Inter, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "Wisp Blog — Trading Bot Framework",
    template: "%s | Wisp Blog",
  },
  description:
    "Insights on algorithmic trading, Go development, agentic strategies, and the Wisp framework. Built by traders, for builders.",
  keywords: [
    "trading bot",
    "algorithmic trading",
    "Go programming",
    "Wisp framework",
    "agentic trading",
    "crypto trading",
    "trading strategy",
    "LLM trading",
  ],
  openGraph: {
    title: "Wisp Blog",
    description:
      "Insights on algorithmic trading, Go development, and agentic strategies.",
    url: "https://blog.usewisp.dev",
    siteName: "Wisp Blog",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wisp Blog",
    description: "Insights on algorithmic trading, Go development, and agentic strategies.",
  },
}

export const viewport: Viewport = {
  themeColor: "#000000",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} ${geistMono.variable}`}
    >
      <body className="antialiased">
        <div className="noise-overlay" />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
