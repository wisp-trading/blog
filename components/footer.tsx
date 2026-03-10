import { GithubIcon } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="relative z-20 border-t border-white/10 bg-black mt-24">
      <div className="px-6 md:px-12 py-6 max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[#888888]">
          {/* Left */}
          <div className="flex items-center gap-3">
            <p className="font-mono text-xs tracking-wider">© 2026 Wisp</p>
            <Link
              href="https://github.com/wisp-trading/wisp"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors duration-300"
              aria-label="GitHub"
            >
              <GithubIcon className="w-4 h-4" />
            </Link>
          </div>

          {/* Center */}
          <div className="flex items-center gap-6 font-mono text-xs tracking-wider">
            <Link
              href="/"
              className="hover:text-white transition-colors duration-300"
            >
              Blog
            </Link>
            <Link
              href="https://usewisp.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors duration-300"
            >
              usewisp.dev
            </Link>
            <Link
              href="https://opensource.org/licenses/MIT"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors duration-300"
            >
              MIT License
            </Link>
          </div>

          {/* Right */}
          <Link
            href="https://go.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-300"
          >
            <span className="text-xs font-normal text-[#999999]">Built in</span>
            <span className="font-mono text-sm font-bold tracking-tight" style={{ color: "#00ADD8" }}>
              GO
            </span>
          </Link>
        </div>
      </div>
    </footer>
  )
}
