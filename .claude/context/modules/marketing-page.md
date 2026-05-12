# Marketing Page Module

## Purpose

Landing page at `/` (route group `(marketing)`): cinematic v2 acquisition page with 12 sections, motion primitives library, ambient background layer, and brand-driven theming. Each section orchestrates scroll-triggered reveals and animated charts. v1 preserved at `/v1` route group.

## Route and structure

- **Route group**: `apps/web/src/app/(marketing)/` renders at `/` (root)
- **Route group**: `apps/web/src/app/(marketing-v1)/v1/` renders at `/v1` (legacy, see "Legacy v1" below)
- **v2 page structure — 12 sections** (in order):
  1. **HeroCinematic** — dark full-viewport hero with cinematic word-by-word headline reveal, golden particles, scroll chevron, atmospheric gradient depth. Headline: "From chaos to command."
  2. **CommandDashboard** (id: `#how-it-works`) — product reveal inside macOS-style browser frame (desktop only; mobile stacked). 3 metric cards (Budget ring, Guest segmented bar, Vendor status dots), animated timeline strip, shagun card, invite preview.
  3. **SplitBudget** — text LEFT, animated bar chart RIGHT (5 budget categories with 0→pct% fill).
  4. **SplitVendor** — table LEFT (data-loading row stagger, risk-dot pulse), text RIGHT, dark bg, layout FLIPped via md:order-*. Mobile: text first, table below.
  5. **WhatsAppLayer** — dark charcoal strip with 3 mock WhatsApp chat bubbles (sent/received), animated typing dots, quick-reply chips. Tagline: "342 guests coordinated. Zero missed messages."
  6. **GuestIntelligence** — clip-reveal stats strip, spring-scatter tag cloud, SVG arc-draw donut chart, rotating live RSVP feed (3s interval via setInterval).
  7. **MemoriesGallery** — warm bg-bg-alt section. 7 photo placeholder boxes with gradient tints (champagne/rose/beige) in responsive 3/4-col grid; one featured 2-row span. Spring scatter entrance, ambient float per box. Feature chip row below.
  8. **ThemeImmersive** (id: `#themes`) — full-bleed gradient with 2-layer crossfade, 3D rotateY card flip on theme change, 6 swatches. Replaced clip-path entrance with opacity+scale fallback.
  9. **MetricsRibbon** — dark ribbon with opacity+scale entrance, 3 useCountUp stats, golden particles. Replaced clip-reveal-ltr with opacity+scale fallback.
  10. **RelationshipLedger** — dark mysterious teaser (`#0A0A0A`). 11-node SVG constellation graph with 16 hard-coded edges, distance-from-center stagger reveal. "Coming 2026" tagline.
  11. **BuildingPublic** — vertical timeline with line-draw animation up to in-progress node. 5 milestones (2 shipped, 1 in-progress with pulse-ring, 2 coming-soon).
  12. **CtaGravity** (id: `#waitlist`) — full-viewport dark CTA. Headline: "Indian weddings were never meant to run on spreadsheets and chaos." Stat counter strip, faint dashboard silhouette background. Perpetual radial gradient pulse, UI-only waitlist form, conditional confetti ParticleField on submit.

## Component breakdown

### Server Components
- **`layout.tsx`** — Wraps v2 page in BrandProvider, V2Header, V2Footer, BrandSwitcher. Renders children into `<main>` block.
- **`page.tsx`** — Mounts AmbientLayer once at top, then assembles 12 v2 sections in sequence with SectionBridge color-transition divs between sections (HeroCinematic → CtaGravity).

### v2 Client Components & Motion Primitives
**Shell:**
- **`V2Header`** (sticky, client) — Scroll-driven width expansion (maxWidth 72rem→100%, padding widens), text color adapts white→charcoal on scroll past 100px, frosted glass background. Single right-side flex group with nav links + CTA.
- **`V2Footer`** (server) — Minimal dark footer: logo, tagline, copyright, social links.
- **`V2MobileNav`** (client) — Hamburger + portal-rendered overlay (createPortal to document.body). Mount-guarded via useSyncExternalStore. Body scroll lock when open.

**Motion Primitives Library** (`apps/web/src/app/(marketing)/components/v2/motion/`):
1. **`useScrollReveal(options)`** — IntersectionObserver hook (generic over HTMLElement). Options: `threshold`, `delay`, `triggerOnce` (default **false** — animations replay on re-entry; pass `true` to latch on first reveal), `rootMargin` (default **'0px 0px -10% 0px'** — triggers slightly before fully visible). Returns `{ ref, isVisible }`. Respects `useReducedMotion()`. Listens to window `reveal:rearm` CustomEvent for bfcache re-arming (dispatched by PageRestoreGuard).
2. **`useCountUp(value, options)`** — Animated count-up via framer-motion. Handles integers, ranges, currency with regex parser. Generic over HTMLElement. Respects `useReducedMotion()`.
3. **`useParallax(options)`** — Scroll-linked translateY via framer-motion useScroll/useTransform. Does NOT enforce reduced-motion (consumer guards).
4. **`TextReveal`** — Word/character/center directional reveal via framer-motion variants. Props: `text`, `as`, `mode` ('word'|'character'), `stagger`, `delay`, `direction` ('up'|'left'|'right'|'center'), `triggerOnVisible`, `threshold`, `parentInView` (optional — when provided, skips creating own IntersectionObserver and uses parent's in-view boolean instead to avoid stacking observers).
5. **`MagneticHover`** — Cursor-following spring displacement (max 8px).
6. **`StaggerChildren`** — Directional staggered reveal wrapper. Props: `parentInView` (optional — same as TextReveal).
7. **`FloatingElement`** — CSS @keyframes float-y ambient float (zero JS cost). Respects `prefers-reduced-motion`.
8. **`ParticleField`** — Leaves/confetti/dots variants with stable random seed via useEffect (NOT useMemo per react-hooks purity rule). Cleanup on unmount.
9. **`AmbientLayer`** — Fixed full-viewport layer with two drifting radial-gradient orbs (brand-primary 3%, champagne 2%) parallaxing with scroll. Mounted once at top of page behind all sections (`z-0`). Respects `useReducedMotion()`.
10. **`PageRestoreGuard`** — Client Component mounted in `layout.tsx` inside `BrandProvider`. Single global `pageshow` listener. On `e.persisted === true` (bfcache restore), forces layout flush and dispatches window `reveal:rearm` CustomEvent to re-arm all `useScrollReveal` instances.
11. **`SectionBridge`** — Pure Server Component markup. Gradient transition div between sections, props: `fromColor`, `toColor`, `height`. No motion; renders thin linear-gradient strip.

**Section Components:**
- **`HeroCinematic`** — Dark hero with 3-layer atmospheric gradient depth, golden particles, TextReveal word-by-word headline, scroll chevron cue. Entrance choreography compressed to ~1.5s total. Four perpetual loops (drifting fog, headline breathing, primary CTA glow pulse, chevron bounce) pause when hero scrolls out of view via framer-motion `useInView`.
- **`CommandDashboard`** — Browser frame container, metric cards (Budget/Guest/Vendor), timeline strip, sample shagun/invite cards. Desktop: frame visible; mobile: stacked content.
- **`SplitBudget`** — Animated bar chart (5 categories, 0→pct% fill) RIGHT; text content LEFT.
- **`SplitVendor`** — Vendor risk table (row stagger on mount, risk-dot pulse) LEFT; text RIGHT. Layout FLIPped on mobile via `md:order-*`.
- **`WhatsAppLayer`** — Dark strip with 3 mock WhatsApp chat bubbles (sent/received directional fade-slide), typing indicator dots (bounce loop), quick-reply chips. Tagline callout.
- **`GuestIntelligence`** — Clip-reveal stats strip, spring-scatter tag cloud (stable seed, NOT Math.random), SVG donut chart with arc-draw entrance, rotating RSVP feed (3s setInterval).
- **`MemoriesGallery`** — Warm bg-bg-alt section. 7 photo boxes (3 gradient tints: champagne/rose/beige) in responsive 3/4-col grid; one featured 2-row span. Spring scatter entrance (uses section-level IntersectionObserver, not per-box), ambient float per box, feature chip row.
- **`ThemeImmersive`** — Full-bleed theme gradient (2-layer opacity crossfade for tween workaround), 3D rotateY card flip on selection, 6 theme swatches. Uses opacity+scale entrance (replaced clip-path to avoid permanent-invisible bug).
- **`MetricsRibbon`** — Dark ribbon section with opacity+scale entrance (replaced clip-reveal-ltr), 3 `useCountUp` stats (extracted to `StatBlockAnimated`), golden ParticleField.
- **`RelationshipLedger`** — Dark mysterious teaser. 11-node SVG constellation graph with 16 hard-coded edges. Distance-from-center stagger reveal driven by the section's own `useScrollReveal`; headline `TextReveal` uses `parentInView` to skip a redundant observer. "Coming 2026" tagline.
- **`BuildingPublic`** — Vertical milestone timeline with line-draw animation. Node states: checkmark (shipped), pulse-ring (in-progress), coming-soon badge.
- **`CtaGravity`** — Full-viewport dark CTA. TextReveal headline (center direction), stat counter strip (342 guests, ₹22L lakhs, 12 vendors), faint dashboard silhouette background (6% opacity). Perpetual radial gradient pulse (6-12% opacity range), UI-only waitlist form, conditional confetti ParticleField on submit.

**Key architectural patterns:**
- **AmbientLayer + SectionBridge**: Fixed full-viewport orb layer parallaxes behind all sections (`z-0`). SectionBridge divs inject thin gradient strips between sections to smooth dark-to-light color transitions. Eliminates jarring jumps.
- **Entrance animation fallback**: ThemeImmersive and MetricsRibbon moved from clip-path (`circle(0%)` permanent-invisible bug) to opacity+scale entrance. No permanent-invisible failure mode if IntersectionObserver fires before ref attaches.
- **No JSX-variable double-mount**: each section uses single render path with responsive Tailwind for mobile/desktop differences (avoids hydration/hook bugs).
- **Hydration safety**: all `typeof window && matchMedia(...)` replaced with framer-motion `useReducedMotion()` hook. No Math.random in lazy useState initializers; stable seed offsets for entrance animations (MemoriesGallery STABLE_ENTRY array, RelationshipLedger fixed node/edge layout).
- **`useCountUp` parser**: handles integers, ranges, currency suffixes — but animates only leading numbers (e.g., "₹15-80L" animates "15" only; suffix static). Used where numeric part is clean; static text fallback elsewhere.
- **Bfcache restore protocol**: Single dispatcher (PageRestoreGuard in layout.tsx) listens for browser `pageshow` events. On `e.persisted === true`, dispatches window `reveal:rearm` CustomEvent. All `useScrollReveal` instances listen for this event and re-arm their IntersectionObserver state. This ensures scroll-triggered animations re-play correctly when user navigates back to the page via browser back button.
- **Stacked observer avoidance**: Components that use `parentInView` prop (TextReveal, StaggerChildren in hero and galleries) skip creating their own IntersectionObserver and instead use the parent section's visibility state. Reduces browser observer count and improves scroll performance.

## Brand system

- **`BrandProvider`** — Relocated to `apps/web/src/components/providers/brand-provider.tsx`. Injects CSS custom properties (--brand-primary, --brand-light, --brand-lighter, --brand-text) at runtime based on `NEXT_PUBLIC_BRAND` env var.
- **`BrandSwitcher`** — Relocated to `apps/web/src/components/providers/brand-switcher.tsx`. Dev-only floating widget; returns `null` in production. Allows runtime theme switching during development.
- **`NEXT_PUBLIC_BRAND` env var** — Values: `plum | wine | sapphire | teal`. Evaluated at build time. Default: `plum`. Next.js inlines the value, so brand is a compile-time constant.
- **Theme data** — THEMES map + THEME_NAMES array imported from `@/lib/themes` (re-exported from `@repo/shared-types` shared package).
- **Font preload** — Only Marcellus (display font) is auto-preloaded in `apps/web/src/app/layout.tsx`. Inter and JetBrains_Mono carry `preload: false` to optimize initial page load.

## Navigation anchors

- Fragment links: `#how-it-works`, `#themes`, `#waitlist`
- V2Header nav group: "How It Works" → #how-it-works, "Themes" → #themes, "Get Early Access" → #waitlist
- HeroCinematic CTAs: "Watch It Work ↓" → #how-it-works, "Get Early Access" → #waitlist

## Styling

- No images; CSS gradients (theme.grad, immersive gradients), inline SVG icons, emoji decoration only
- New keyframes in globals.css: `float-y`, `confetti-fall`, `dot-drift`, `shimmer-sweep`, `confetti-burst`, `pulse-ring`, `clip-reveal-ltr`, `clip-reveal-circle`
- New classes: `.float-element`, `.shimmer-hover`, `.particle-confetti`, `.particle-dot`
- All motion classes extended with `@media (prefers-reduced-motion: reduce)` suppression block
- Button system: primary CTAs get `shadow-md hover:shadow-xl hover:scale-[1.03] active:scale-[0.97] transition-all duration-200`. Outline CTAs get `hover:scale-[1.02]` with color-mix bg tint.
- Responsive: mobile-first; desktop-only elements (CommandDashboard browser frame) hidden on mobile via Tailwind `hidden md:block`


## Dependencies

- **Runtime**: `framer-motion ^12.38.0` (all motion primitives, section animations, scroll transforms, useReducedMotion detection)
- `@/components/providers/*` — BrandProvider, BrandSwitcher (relocated from marketing layout)
- `@/lib/themes` — THEMES, THEME_NAMES, ThemeName type (from shared-types)
- `@/lib/utils` — cn() helper (Tailwind class merge)
- React hooks — useState, useEffect, useRef, useCallback, useMemo, useSyncExternalStore (MobileNav mount guard), IntersectionObserver, requestAnimationFrame

## Legacy v1

v1 of this page is preserved at `/v1` route group (`apps/web/src/app/(marketing-v1)/v1/`). Components:
- `page.tsx`, `layout.tsx` — v1 page structure (6 sections: Hero, StepTimeline, CountUpStat, ThemeCarousel, BuildingPublic, Waitlist)
- `components/` — FadeInSection, GoldenParticles, MarketingHeader, MobileNav, WaitlistForm, CountUpStat, ThemeCarousel, TickerStrip, StepTimeline

v1 remains fully functional for reference or A/B testing. No active development; changes should target v2 sections in `(marketing)/` instead.
