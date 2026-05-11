# Utsavs — Cowork Visual QA Briefing

> **Purpose**: This document bootstraps any new Cowork session for browser-based visual QA of the Utsavs marketing landing page. It is designed to work regardless of how much code progress has been made — just read it, open the site, and start reviewing.
>
> **Workflow split**: Code changes happen in Claude Code CLI (which has the full pipeline with agents, hooks, risk tiers). Cowork is used only for browser verification — taking screenshots, testing interactions, checking responsiveness, and reporting bugs back as prompts for Claude Code.

---

## 1. Project Overview

Utsavs is an Indian wedding planning platform. The marketing landing page lives at `localhost:3000` (Next.js dev server via Docker). It's a single-page scroll experience with ~15 sections, featuring glassmorphism panels, framer-motion animations, and a "Dynamic Island" floating navbar.

The page is meant to feel editorial, premium, and restrained — think Apple product page meets Indian wedding elegance. No bright gradients or SaaS clichés.

---

## 2. How to Start a QA Session

1. The site runs at **`http://localhost:3000/`** (the v2 marketing page)
2. There's also a legacy v1 at `/v1` — ignore it unless specifically asked
3. Docker must be running: `docker compose up -d web` from the monorepo root
4. If the site isn't loading, the user needs to start Docker first — Cowork can't do this

---

## 3. Tech Stack (what matters for visual QA)

- **Next.js 15** (App Router) with React Server Components
- **Tailwind CSS v4** (uses `@theme inline` in globals.css, not tailwind.config)
- **framer-motion** for all animations (scroll-triggered reveals, AnimatePresence rotations, parallax)
- **CSS custom properties** for colors, shadows, motion easings
- **Brand system**: runtime-switchable brand colors via `--brand-primary`, `--brand-light`, etc. Default brand is "plum" (`#7c2d6e`)
- **No dark mode** — the page has dark sections (hero, vendor, CTA) and light sections (dashboard, budget, guest intelligence), but this is by design, not a theme toggle

---

## 4. Page Structure (scroll order)

The page renders these sections top to bottom, with gradient `SectionBridge` divs between them:

| # | Component | Background | `data-nav-theme` | What it shows |
|---|-----------|-----------|-------------------|---------------|
| 1 | `HeroCinematic` | `#0A0A0A` (dark) | `dark` | Hero headline "From Chaos to Command", animated particles, CTA buttons |
| 2 | *SectionBridge* | dark → light gradient | — | 220px tall gradient transition |
| 3 | `CommandDashboard` | light (`--color-bg`) | `light` | Mock dashboard with stat cards, Event Timeline, Live Activity feed, Shagun, Invitation |
| 4 | `SplitBudget` | light | `light` | Budget breakdown panel + "Know where every rupee went" copy |
| 5 | *SectionBridge* | light → dark gradient | — | 200px transition |
| 6 | `SplitVendor` | `#1A1A1A` (dark) | `dark` | Vendor management table (6 vendors) + copy |
| 7 | `WhatsAppLayer` | dark | `dark` | WhatsApp integration mockup with chat bubbles |
| 8 | *SectionBridge* | dark → light gradient | — | 200px transition |
| 9 | `GuestIntelligence` | light (`--color-bg-alt`) | `light` | Guest list management with donut charts |
| 10 | `MemoriesGallery` | light | `light` | Photo gallery grid |
| 11 | `ThemeImmersive` | dark | `dark` | Theme showcase with immersive visuals |
| 12 | `MetricsRibbon` | dark | `dark` | Horizontal scrolling metrics strip |
| 13 | `RelationshipLedger` | dark (`#0A0A0A`) | `dark` | Family relationship tracking — the "emotional core" section |
| 14 | *SectionBridge* | dark → light gradient | — | 200px transition |
| 15 | `BuildingPublic` | light | `light` | "Building in public" roadmap/transparency section |
| 16 | *SectionBridge* | light → dark gradient | — | 200px transition |
| 17 | `CtaGravity` | dark (`#0A0A0A`) | `dark` | Final CTA with waitlist form |

---

## 5. The Navbar (Dynamic Island)

The navbar (`V2Header`) is a floating pill that sits `fixed top-4` and is always visible.

**Key behaviors to verify:**
- **Compact state** (scrollY < 400px): Centered pill, `maxWidth: 38rem` (~600px). Sits over the dark hero.
- **Expanded state** (scrollY > 400px): Stretches to `maxWidth: 72rem` with `calc(100% - 2rem)` width. Logo pushes left, buttons push right.
- **Section-aware theming**: Uses `IntersectionObserver` on `[data-nav-theme]` elements. Over dark sections → dark glassmorphism (`rgba(10,10,10,0.72)`). Over light sections → light glassmorphism (`rgba(247,245,242,0.68)`).
- **Transition**: `duration-700 ease-out` for smooth width + color changes
- **Contents**: "utsavs" logo (left), "How It Works" anchor link + "Get Early Access" button (right). No "Themes" button.
- **Mobile**: Uses `V2MobileNav` hamburger (visible below `md` breakpoint)

---

## 6. Animation System

All animations use `framer-motion` with custom hooks:

- **`useScrollReveal`**: IntersectionObserver-based visibility toggle. Default `triggerOnce: false` — animations replay when scrolling back up.
- **`TextReveal`**: Word-by-word text entrance animation
- **`StaggerChildren`**: Staggers child element entrances with configurable delay
- **`FloatingElement`**: Gentle floating/bobbing animation
- **`MagneticHover`**: Cursor-following magnetic effect
- **`AmbientLayer`**: Background particle system (golden leaf particles)
- **`SectionBridge`**: Pure CSS gradient divs between sections (no JS)
- **`AnimatePresence`**: Used in `CommandDashboard` for Live Activity feed rotation (`mode="popLayout"` to prevent layout shifts)

**Reduced motion**: All hooks respect `prefers-reduced-motion: reduce` — animations are skipped, elements appear immediately.

---

## 7. Design Tokens Quick Reference

**Colors (CSS vars)**:
- Background: `--color-bg: #f7f5f2` (warm off-white), `--color-bg-alt: #fbf9f6`
- Text: `--color-text: #171717`, `--color-text-muted: #6b7280`
- Brand: `--brand-primary: #7c2d6e` (plum), `--brand-light: #a855a0`, `--brand-lighter: #f3e8f1`
- Dark sections: `#0A0A0A` or `#1A1A1A`
- Jewel tones: emerald `#0f4c3a`, champagne `#c8a96b`, navy `#1b1f3b`, maroon `#5b1a2b`

**Typography**:
- Display: Marcellus (serif) — headings, logo
- Sans: Inter — body text, labels
- Mono: JetBrains Mono — code/data
- Eyebrow class: 11px, 500 weight, 0.12em letter-spacing, uppercase

**Motion**:
- Fast: `cubic-bezier(0.16, 1, 0.3, 1)` / 120ms
- Smooth: `cubic-bezier(0.4, 0, 0.2, 1)` / 220ms
- Cinematic: `cubic-bezier(0.65, 0, 0.35, 1)` / 720ms

---

## 8. Known Patterns & Past Bugs (Reference)

These have been fixed but are good to re-check if code changes nearby:

| Area | What was wrong | How it was fixed |
|------|---------------|-----------------|
| `GuestIntelligence` donut chart | Hydration mismatch (random data on SSR vs client) | Moved random data generation into `useState` initializer |
| `CommandDashboard` Live Activity | Layout glitch — timeline jumped when entries rotated | Changed `AnimatePresence mode="sync"` → `mode="popLayout"`, added `overflow-hidden` |
| `SplitVendor` status chips | "● Locked" / "◐ Pending" text wrapping below the dot | Added `minmax(90px,1fr)` to grid, created separate mobile card layout |
| Section transitions | Abrupt dark↔light jumps | Increased SectionBridge heights to 200-220px |
| Navbar | Was static width, covered section text | Added scroll-expand (compact→wide), removed "Themes" button |
| Animations | Only played once | Set `triggerOnce: false` on all scroll-reveal hooks |

---

## 9. QA Checklist Template

Use this as a starting framework when reviewing the site. Adapt based on what changed:

### Full-page scroll check
- [ ] Hero loads cleanly — particles animate, headline reveals, CTAs are visible
- [ ] Navbar starts compact (~600px pill) over the dark hero
- [ ] Navbar expands smoothly when scrolling past the hero heading (~400px)
- [ ] Section bridge gradients are smooth (no hard color jumps)
- [ ] Each section's scroll-reveal animations trigger when entering viewport
- [ ] Navbar glassmorphism color switches correctly at dark↔light boundaries
- [ ] Scrolling back up replays exit→enter animations

### Component-specific checks
- [ ] Dashboard: Live Activity rotates entries every ~4s without layout jump
- [ ] Dashboard: Event Timeline, Shagun, Invitation cards stay stable during rotation
- [ ] Budget: Category bars render correctly, family toggle chips work
- [ ] Vendor: Status chips (Locked/Pending) don't wrap on desktop
- [ ] Vendor: Mobile layout uses compact card view (if testable)
- [ ] WhatsApp: Chat bubbles stagger in, typing indicator animates
- [ ] Guest Intelligence: Donut charts render without hydration errors (check console)
- [ ] Theme: Immersive visuals transition smoothly
- [ ] Relationship Ledger: Cards animate, content is meaningful
- [ ] CTA: Waitlist form input is functional, button has hover state

### Navbar detail checks
- [ ] Compact state: pill is centered, ~600px max-width
- [ ] Expanded state: stretches to ~72rem, logo left, buttons right
- [ ] Dark section: dark glass background, white text
- [ ] Light section: light glass background, dark text
- [ ] "How It Works" scrolls to the correct anchor
- [ ] "Get Early Access" scrolls to waitlist / CTA section
- [ ] Mobile: hamburger menu works (needs md breakpoint)

### Console check
- [ ] No hydration errors in browser console
- [ ] No React warnings
- [ ] No 404s for assets

---

## 10. File Map (for reference when writing bug reports)

```
apps/web/src/app/
├── globals.css                          # Design tokens, CSS vars, @theme
├── (marketing)/
│   ├── layout.tsx                       # BrandProvider + V2Header + V2Footer
│   ├── page.tsx                         # Section ordering + SectionBridges
│   └── components/v2/
│       ├── v2-header.tsx                # Dynamic Island navbar
│       ├── v2-footer.tsx                # Footer
│       ├── v2-mobile-nav.tsx            # Mobile hamburger menu
│       ├── hero-cinematic.tsx           # Hero section
│       ├── command-dashboard.tsx         # Dashboard + Live Activity
│       ├── split-budget.tsx             # Budget breakdown
│       ├── split-vendor.tsx             # Vendor management table
│       ├── whatsapp-layer.tsx           # WhatsApp integration
│       ├── guest-intelligence.tsx       # Guest list + donut charts
│       ├── memories-gallery.tsx         # Photo gallery
│       ├── theme-immersive.tsx          # Theme showcase
│       ├── metrics-ribbon.tsx           # Metrics horizontal strip
│       ├── relationship-ledger.tsx      # Family relationship tracking
│       ├── building-public.tsx          # Building in public section
│       ├── cta-gravity.tsx              # Final CTA + waitlist
│       └── motion/
│           ├── section-bridge.tsx       # Gradient transition divs
│           ├── use-scroll-reveal.ts     # IntersectionObserver hook
│           ├── text-reveal.tsx          # Word-by-word text animation
│           ├── stagger-children.tsx     # Staggered entrance wrapper
│           ├── floating-element.tsx     # Gentle floating animation
│           ├── magnetic-hover.tsx       # Cursor-follow magnetic effect
│           ├── ambient-layer.tsx        # Background particle system
│           ├── particle-field.tsx       # Particle rendering
│           ├── use-count-up.ts          # Number counting animation
│           └── use-parallax.ts          # Parallax scroll hook
```

---

## 11. How to Report Bugs Back to Claude Code

When you find issues during QA, write them as a clear prompt for Claude Code. Include:

1. **Which component** (use the filename from the file map above)
2. **What's wrong** (be specific — "wraps on mobile" not "looks bad")
3. **Where on screen** (section name, approximate scroll position)
4. **Screenshot reference** (if you took one during the session)

Example format:
```
Bug in split-vendor.tsx: On mobile (375px viewport), the "◐ Pending" status chip
text wraps below the dot character in the Lens Studio row. The grid column for
STATUS needs a min-width. Desktop is fine.
```

---

## 12. Brand Switcher (Dev Tool)

There's a floating `BrandSwitcher` component (small colored circles in the bottom-right corner). It lets you toggle between brand color palettes at runtime:

- **Plum** (default): `#7c2d6e` — purple-maroon
- **Maroon**: `#5b1a2b` — deep red-brown  
- **Navy**: `#1b1f3b` — deep blue
- **Emerald**: `#0f4c3a` — dark green

When reviewing, check that the active brand color appears correctly in: the "Get Early Access" button, hero CTA, section accents, and any brand-tinted elements. This is a dev-only tool, not visible in production.
