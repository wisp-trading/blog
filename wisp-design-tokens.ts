// wisp-design-tokens.ts
// SINGLE SOURCE OF TRUTH for all Wisp Blog styling
// Keep in sync with landing-page/wisp-design-tokens.ts

export const WispDesign = {
  // ====================
  // COLORS
  // ====================
  colors: {
    bg: {
      primary: "#000000",    // Pure black - page background
      secondary: "#0a0a0a",  // Very dark gray - content areas
      tertiary: "#171717",   // Dark gray - cards, sidebar
      code: "#1a1a1a",       // Code blocks
      elevated: "#262626",   // Hover states
    },

    text: {
      primary: "#ffffff",    // Headings
      secondary: "#e5e5e5",  // Body text
      muted: "#a1a1aa",      // Descriptions, labels, meta
      disabled: "#737373",   // Disabled states
    },

    brand: {
      teal: "#00d4ff",                        // Primary accent — USE SPARINGLY
      tealSoft: "rgba(0, 212, 255, 0.1)",     // Backgrounds
      tealBorder: "rgba(0, 212, 255, 0.2)",   // Borders
      tealGlow: "rgba(0, 212, 255, 0.15)",    // Subtle glow
    },

    border: {
      subtle: "rgba(255, 255, 255, 0.05)",
      default: "rgba(255, 255, 255, 0.1)",
      strong: "rgba(255, 255, 255, 0.2)",
    },

    semantic: {
      success: "#00ff88",
      warning: "#ffaa00",
      error: "#ff4444",
      info: "#00d4ff",
    },
  },

  // ====================
  // TYPOGRAPHY
  // ====================
  typography: {
    fonts: {
      // Playfair Display — display headings (article titles, hero h1)
      display: "'Playfair Display', Georgia, serif",
      // Inter — body copy, UI labels, navigation
      sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      // JetBrains Mono / Geist Mono — code, mono labels, tags
      mono: "'JetBrains Mono', 'Geist Mono', 'Fira Code', monospace",
    },

    sizes: {
      xs: "0.75rem",    // 12px — meta, tags
      sm: "0.875rem",   // 14px — captions, small labels
      base: "1rem",     // 16px — body
      lg: "1.125rem",   // 18px — lead paragraph
      xl: "1.25rem",    // 20px
      "2xl": "1.5rem",  // 24px — h3
      "3xl": "1.875rem",// 30px — h2
      "4xl": "2.5rem",  // 40px — h1 (blog index title)
      "5xl": "3rem",    // 48px
      "6xl": "4rem",    // 64px — hero article title
    },

    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },

    lineHeights: {
      tight: 1.25,      // Display headings
      normal: 1.5,      // UI elements
      relaxed: 1.7,     // Body copy — optimal for reading
      loose: 1.9,       // Long-form article paragraphs
    },

    letterSpacing: {
      tight: "-0.02em",  // Display headings
      normal: "0",
      wide: "0.05em",    // Mono labels, uppercase tags
      wider: "0.1em",    // Small caps, section labels
    },
  },

  // ====================
  // SPACING
  // ====================
  spacing: {
    xs: "0.5rem",    // 8px
    sm: "1rem",      // 16px
    md: "1.5rem",    // 24px
    lg: "2rem",      // 32px
    xl: "2.5rem",    // 40px
    "2xl": "4rem",   // 64px
    "3xl": "6rem",   // 96px
    "4xl": "8rem",   // 128px
  },

  // Blog-specific layout
  layout: {
    contentMaxWidth: "720px",  // Article body column width
    wideMaxWidth: "960px",     // Wide content (code, images)
    pageMaxWidth: "1200px",    // Full page max width
    sidebarWidth: "240px",
  },

  // ====================
  // EFFECTS
  // ====================
  effects: {
    radius: {
      sm: "4px",
      md: "6px",
      lg: "8px",
      xl: "12px",
      full: "9999px",
    },

    blur: {
      sm: "blur(4px)",
      md: "blur(8px)",
      lg: "blur(12px)",
    },

    transition: {
      fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
      base: "300ms cubic-bezier(0.4, 0, 0.2, 1)",
      slow: "500ms cubic-bezier(0.4, 0, 0.2, 1)",
    },

    shadow: {
      sm: "0 1px 2px rgba(0, 0, 0, 0.5)",
      md: "0 4px 6px rgba(0, 0, 0, 0.5)",
      lg: "0 8px 16px rgba(0, 0, 0, 0.5)",
      teal: "0 8px 24px rgba(0, 212, 255, 0.15)",
    },
  },

  // ====================
  // COMPONENT PATTERNS
  // ====================
  components: {
    // Post card on index page
    postCard: {
      background: "rgba(10, 10, 10, 0.6)",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      borderRadius: "12px",
      padding: "2rem",
      transition: "500ms cubic-bezier(0.4, 0, 0.2, 1)",
      hover: {
        borderColor: "rgba(0, 212, 255, 0.2)",
        background: "rgba(10, 10, 10, 0.9)",
        transform: "translateY(-4px)",
      },
    },

    // Inline code
    inlineCode: {
      background: "#1a1a1a",
      color: "#00d4ff",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      padding: "0.15rem 0.375rem",
      borderRadius: "4px",
      fontSize: "0.875em",
      fontFamily: "'JetBrains Mono', monospace",
    },

    // Code block
    codeBlock: {
      background: "#1a1a1a",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: "8px",
      padding: "1.25rem",
      fontSize: "0.875rem",
      fontFamily: "'JetBrains Mono', monospace",
      lineHeight: 1.7,
    },

    // Tag/category pill
    tag: {
      background: "rgba(0, 212, 255, 0.08)",
      border: "1px solid rgba(0, 212, 255, 0.2)",
      color: "#00d4ff",
      borderRadius: "9999px",
      padding: "0.2rem 0.75rem",
      fontSize: "0.75rem",
      fontFamily: "'JetBrains Mono', monospace",
      letterSpacing: "0.05em",
      textTransform: "uppercase",
    },

    // CTA button
    button: {
      background: "rgba(0, 0, 0, 0.4)",
      backdropFilter: "blur(12px)",
      border: "2px solid rgba(255, 255, 255, 0.2)",
      color: "#ffffff",
      borderRadius: "9999px",
      padding: "0.875rem 2rem",
      fontFamily: "'JetBrains Mono', monospace",
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      transition: "500ms cubic-bezier(0.4, 0, 0.2, 1)",
      hover: {
        background: "rgba(0, 212, 255, 0.1)",
        borderColor: "rgba(0, 212, 255, 0.4)",
        color: "#00d4ff",
      },
    },
  },

  // ====================
  // USAGE RULES
  // ====================
  usage: {
    rules: [
      "Teal (#00d4ff) is an ACCENT — links, tags, inline code, active states only",
      "No teal text in body copy — only interactive/code elements",
      "Playfair Display for article titles and display headings only",
      "Inter for all body text, nav labels, UI copy",
      "JetBrains Mono for code, tags, nav items, version strings",
      "Pure black (#000000) base, very dark grays for depth",
      "Glassmorphism (backdrop-filter: blur) for overlaid elements",
      "Body copy line-height: 1.7–1.9 for readability",
      "Max article width 720px — don't stretch prose wider",
      "Keep transitions 300–500ms for meaningful interactions",
    ],
  },
} as const

// ====================
// CSS VARIABLES
// ====================
export const cssVariables = `
:root {
  /* Backgrounds */
  --wisp-bg-primary: #000000;
  --wisp-bg-secondary: #0a0a0a;
  --wisp-bg-tertiary: #171717;
  --wisp-bg-code: #1a1a1a;
  --wisp-bg-elevated: #262626;

  /* Text */
  --wisp-text-primary: #ffffff;
  --wisp-text-secondary: #e5e5e5;
  --wisp-text-muted: #a1a1aa;
  --wisp-text-disabled: #737373;

  /* Brand */
  --wisp-teal: #00d4ff;
  --wisp-teal-soft: rgba(0, 212, 255, 0.1);
  --wisp-teal-border: rgba(0, 212, 255, 0.2);
  --wisp-teal-glow: rgba(0, 212, 255, 0.15);

  /* Borders */
  --wisp-border-subtle: rgba(255, 255, 255, 0.05);
  --wisp-border-default: rgba(255, 255, 255, 0.1);
  --wisp-border-strong: rgba(255, 255, 255, 0.2);

  /* Typography */
  --wisp-font-display: 'Playfair Display', Georgia, serif;
  --wisp-font-sans: 'Inter', -apple-system, sans-serif;
  --wisp-font-mono: 'JetBrains Mono', 'Geist Mono', monospace;

  /* Layout */
  --wisp-content-width: 720px;
  --wisp-wide-width: 960px;
  --wisp-page-width: 1200px;

  /* Effects */
  --wisp-blur: blur(12px);
  --wisp-transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --wisp-transition-base: 300ms cubic-bezier(0.4, 0, 0.2, 1);
  --wisp-transition-slow: 500ms cubic-bezier(0.4, 0, 0.2, 1);

  /* Radius */
  --wisp-radius-sm: 4px;
  --wisp-radius-md: 6px;
  --wisp-radius-lg: 8px;
  --wisp-radius-xl: 12px;
  --wisp-radius-full: 9999px;
}
`
