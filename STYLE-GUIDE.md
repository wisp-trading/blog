# Wisp Blog — Style Guide

> **Source of truth:** `wisp-design-tokens.ts`
> Keep that file and this guide in sync with `landing-page/wisp-design-tokens.ts`.

---

## 1. Color Palette

The blog is always dark. There is no light mode.

| Token | Hex | Usage |
|---|---|---|
| `--wisp-bg-primary` | `#000000` | Page background |
| `--wisp-bg-secondary` | `#0a0a0a` | Content areas, cards |
| `--wisp-bg-tertiary` | `#171717` | Sidebar, elevated surfaces |
| `--wisp-bg-code` | `#1a1a1a` | Code blocks |
| `--wisp-bg-elevated` | `#262626` | Hover states |
| `--wisp-text-primary` | `#ffffff` | Headings |
| `--wisp-text-secondary` | `#e5e5e5` | Body copy |
| `--wisp-text-muted` | `#a1a1aa` | Labels, meta, descriptions |
| `--wisp-text-disabled` | `#737373` | Disabled / placeholder |
| `--wisp-teal` | `#00d4ff` | **Accent — use sparingly** |
| `--wisp-teal-soft` | `rgba(0,212,255,0.1)` | Tag backgrounds |
| `--wisp-teal-border` | `rgba(0,212,255,0.2)` | Tag/card hover borders |
| `--wisp-teal-glow` | `rgba(0,212,255,0.15)` | Hover glow (max 0.15) |

### Rules
- **Teal is an accent** — use only on: links, inline code, tags, active nav, hover borders.
- Never use teal for body paragraph text.
- Glow effects (`box-shadow`) must not exceed `rgba(0,212,255,0.15)`.
- Borders are always white-alpha, not colored.

---

## 2. Typography

### Font Stack

| Role | Font | CSS Variable | Where |
|---|---|---|---|
| Display / headings | Playfair Display | `--font-display` | Article titles, hero H1, H2 |
| Body / UI | Inter | `--font-sans` | Paragraphs, nav, labels |
| Code / mono | Geist Mono | `--font-mono` | Code blocks, tags, version strings |

### Type Scale

| Size | rem | Intended use |
|---|---|---|
| `xs` | 0.75rem | Tags, meta, captions |
| `sm` | 0.875rem | Code, small labels |
| `base` | 1rem | Body copy |
| `lg` | 1.125rem | Lead paragraph |
| `2xl` | 1.5rem | H3 |
| `3xl` | 1.875rem | H2 |
| `4xl` | 2.5rem | H1 (index page title) |
| `6xl` | 4rem | Hero article title |

### Rules
- Article titles: Playfair Display, bold, `letter-spacing: -0.02em`
- Body copy: Inter, `line-height: 1.7–1.8`
- Mono labels (tags, nav): ALL CAPS, `letter-spacing: 0.05em`
- Never mix display font and mono in the same label

---

## 3. Layout & Spacing

```
Page max-width:    1200px
Article body:       720px  ← prose column, never wider
Wide content:       960px  ← full-bleed code, images
```

### Spacing Scale

| Token | Value | Use |
|---|---|---|
| `xs` | 8px | Tight gaps |
| `sm` | 16px | Component padding |
| `md` | 24px | Section padding |
| `lg` | 32px | Card padding |
| `xl` | 40px | Between sections |
| `2xl` | 64px | Page-level sections |
| `3xl` | 96px | Major page sections |

---

## 4. Components

### Post Card

```
┌─────────────────────────────────────────────────┐
│  [TAG]  [TAG]                                   │
│                                                  │
│  Article Title in Playfair Display              │
│  (hover → teal)                                 │
│                                                  │
│  Short excerpt in Inter, muted color...         │
│                                                  │
│  Mar 10, 2026 — 8 min read          READ →     │
└─────────────────────────────────────────────────┘
```

- Background: `rgba(10,10,10,0.6)`
- Border: `1px solid rgba(255,255,255,0.08)`
- Hover border: `rgba(0,212,255,0.2)`
- Hover lift: `translateY(-4px)`
- Featured variant: larger padding, teal top-border line on hover

### Tag / Category Pill

```
[ FRAMEWORK ]    [ GO ]
```

- Font: Geist Mono, 12px, uppercase, `letter-spacing: 0.05em`
- Background: `rgba(0,212,255,0.08)`
- Border: `1px solid rgba(0,212,255,0.2)`
- Color: `#00d4ff`
- Shape: pill (`border-radius: 9999px`)

### Inline Code

- Background: `#1a1a1a`
- Color: `#00d4ff` (teal)
- Border: `1px solid rgba(255,255,255,0.1)`
- Font: Geist Mono 0.875em

### Code Block

- Background: `#1a1a1a`
- Border: `1px solid rgba(255,255,255,0.1)`
- Radius: `8px`
- Font: Geist Mono, 14px, `line-height: 1.7`
- Full-width on mobile, capped at `var(--wisp-wide-width)` on desktop

### Navigation

- Font: Geist Mono, uppercase, `tracking-wider`
- Color at rest: `var(--wisp-text-muted)`
- Hover: white with underline slide-in animation
- Active page: `var(--wisp-teal)`
- Scrolled header: `bg-black/80 backdrop-blur-md border-b border-white/10`

### Blockquote

- Left border: `3px solid rgba(0,212,255,0.2)`
- Background: `var(--wisp-bg-secondary)`
- Text: italic, muted

---

## 5. Wireframes

### 5.1 Blog Index (`/`)

```
┌──────────────────────────────────────────────────────────────────┐
│ NAVBAR: Wisp Blog | BLOG  DOCS  GITHUB               ● OPEN SRC │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  01 — WRITING                                                      │
│                                                                    │
│  The Wisp                                                         │
│  Blog                         ← Playfair Display, 64–72px        │
│                                                                    │
│  Insights on algorithmic trading...  ← Inter, muted              │
│                                                                    │
│ ─────────────────────────────────────                             │
│  FEATURED                                                         │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ [FRAMEWORK] [GO]                                             │ │
│ │                                                               │ │
│ │ Introducing Wisp: A Trading Bot Framework Built in Go        │ │
│ │                                                               │ │
│ │ Short excerpt text...                                        │ │
│ │                                                               │ │
│ │ Mar 10, 2026 — 8 min read                        READ →     │ │
│ └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│ ─────────────────────────────────────                             │
│  RECENT POSTS                                                     │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐              │
│ │ [LLM]        │ │ [TUTORIAL]   │ │ [TUTORIAL]   │              │
│ │ Agentic...   │ │ Connecting…  │ │ Backtesting… │              │
│ │ Excerpt...   │ │ Excerpt...   │ │ Excerpt...   │              │
│ │ Date · Time  │ │ Date · Time  │ │ Date · Time  │              │
│ └──────────────┘ └──────────────┘ └──────────────┘              │
│                                                                    │
├──────────────────────────────────────────────────────────────────┤
│ FOOTER: © 2026 Wisp  |  Blog  usewisp.dev  MIT License  |  GO  │
└──────────────────────────────────────────────────────────────────┘
```

### 5.2 Post Page (`/posts/[slug]`)

```
┌──────────────────────────────────────────────────────────────────┐
│ NAVBAR                                                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│ ← ALL POSTS                                                       │
│                                                                    │
│ [FRAMEWORK] [GO]                                                  │
│                                                                    │
│  Introducing Wisp: A Trading                                      │
│  Bot Framework Built in Go    ← Playfair Display, 48–64px        │
│                                                                    │
│  Short excerpt / lead paragraph in larger Inter...               │
│                                                                    │
│ Mar 10, 2026 — 8 min read — Wisp Team                           │
│ ───────────────────────────────────────────                       │
│                                                                    │
│  Body copy in Inter, 17px, line-height 1.8, max 720px wide       │
│                                                                    │
│  ## Section Heading in Playfair Display                          │
│                                                                    │
│  Paragraph text with inline `code` in teal...                    │
│                                                                    │
│  ┌──────────────────────────────────────────────┐               │
│  │ // Code block — Geist Mono, dark bg          │               │
│  │ ctx := context.Background()                  │               │
│  └──────────────────────────────────────────────┘               │
│                                                                    │
│  > Blockquote text in italic, muted, teal left border            │
│                                                                    │
│ ───────────────────────────────────────────                       │
│ ← MORE POSTS                          STAR ON GITHUB →           │
│                                                                    │
├──────────────────────────────────────────────────────────────────┤
│ FOOTER                                                            │
└──────────────────────────────────────────────────────────────────┘
```

---

## 6. Motion / Animation

All animations use the landing page's easing curve: `cubic-bezier(0.4, 0, 0.2, 1)`

| Element | Animation | Duration |
|---|---|---|
| Navbar entry | `y: -100 → 0` | 800ms |
| Post card hover | `translateY(-4px)` | 500ms |
| Nav link underline | width `0 → 100%` | 300ms |
| Post card border/bg | color transition | 500ms |
| Mobile menu | opacity fade | 300ms |
| Mobile menu items | `y: 20 → 0`, staggered | 300ms + 100ms delay each |

---

## 7. Effects

### Glassmorphism
Used on overlaid elements (scrolled navbar, floating cards):
```css
background: rgba(10, 10, 10, 0.6);
backdrop-filter: blur(12px);
-webkit-backdrop-filter: blur(12px);
```

### Noise Overlay
Fixed pseudo-texture applied to body via `.noise-overlay` class (3% opacity).
Matches the landing page aesthetic.

### Scrollbar
Custom thin scrollbar (6px), matches dark background.

### Text Selection
```css
::selection {
  background: rgba(0, 212, 255, 0.1);
  color: #ffffff;
}
```

---

## 8. File Structure

```
wisp-blog/
├── app/
│   ├── layout.tsx          ← Fonts (Playfair + Inter + Geist Mono), metadata
│   ├── globals.css         ← CSS variables, prose styles, utilities
│   ├── page.tsx            ← Blog index
│   └── posts/[slug]/
│       └── page.tsx        ← Individual post
├── components/
│   ├── navbar.tsx
│   ├── footer.tsx
│   └── post-card.tsx
├── lib/
│   └── utils.ts            ← cn() helper
└── wisp-design-tokens.ts   ← Single source of truth for design values
```

---

## 9. Content Guidelines

- **Article titles**: Sentence case, avoid clickbait, aim for specificity
- **Excerpt**: 1–2 sentences, max ~160 chars — this doubles as meta description
- **Tags**: Short, capitalized, kept to 2–3 per post (e.g. `Go`, `Tutorial`, `Agentic`)
- **Reading time**: Calculated at ~200 wpm for technical posts
- **Code**: Always use fenced code blocks with a language hint for syntax highlighting
- **Images**: Prefer dark-background screenshots; wrap in `rounded-xl border border-white/5`
