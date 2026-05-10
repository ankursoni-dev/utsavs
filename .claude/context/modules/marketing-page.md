# Marketing Page Module

## Purpose

Landing page at `/` (route group `(marketing)`): acquisition page for Utsavs with 6 sections, waitlist signup, and brand-driven theme showcase. Build-time brand selection via env var; scroll-aware header; production omits dev tools.

## Route and structure

- **Route group**: `apps/web/src/app/(marketing)/`
- **Renders at**: `/` (root)
- **6 sections** (in order):
  1. **Hero** — headline "From chaos to command.", body copy about managing guests/budgets/vendors, CTA buttons to #waitlist and #how-it-works, radial gradient background with brand-primary color
  2. **How It Works** (id: `#how-it-works`) — 4-step sticky-scroll timeline: Budget & Shagun, Vendor Command, Guest Intelligence, Themed Experiences. Desktop: left column scrolls, right column sticky. Progress line (4 dots + connectors) fills with brand-primary color based on scroll position
  3. **Organizer Advantage** (dark charcoal section) — 3 CountUpStat cards (20-50 weddings/year, 6-15 vendors/wedding, ₹15-80L budget range)
  4. **Theme Showcase** (id: `#themes`) — interactive carousel: select from 6 curated themes, preview card + swatch row with adaptive text color based on gradient luminance
  5. **Building in Public** (no id) — milestone list with checkmark/progress/coming-soon indicators
  6. **Waitlist CTA** (id: `#waitlist`) — heading + form + reassurance text

## Component breakdown

### Server Components
- **`layout.tsx`** — Renders child layout, footer with links; header moved to MarketingHeader
- **`page.tsx`** — Root landing page; orchestrates all 6 sections, imports THEMES from shared
- **`TickerStrip`** — Horizontally scrolling ticker with feature list (◆ separator); respects prefers-reduced-motion

### Client Components
- **`FadeInSection`** (NEW) — Scroll-triggered fade-in wrapper component. IntersectionObserver (threshold 0.2) detects when child enters viewport; plays entrance animation once (unobserves after first trigger). Supports optional `delay` (ms) for staggered entrance. Transition: `opacity-0 translate-y-8` → `opacity-100 translate-y-0` over 700ms. Respects `prefers-reduced-motion`.
- **`GoldenParticles`** (NEW) — Decorative animated golden particles (20 absolutely-positioned spans) behind dark sections. Uses `useEffect` + `Math.random()` to generate random positions/sizes/durations (no useMemo, respects project's lint rules). Animated via CSS `@keyframes particle-fall` (translateY -10vh → +110vh with rotation; per-particle duration randomized 6–14s via inline style). `aria-hidden="true"`. Respects `prefers-reduced-motion`.
- **`MarketingHeader`** — Sticky client header with logo + right-side nav group (How It Works, Themes links + CTA button together). On scroll past 100px, inner container expands: `maxWidth` 72rem → 100%, `paddingX` 1.5rem → 2rem (spreads to extremes). Header background: transparent → `rgba(247,245,242,0.85)` + `blur(12px)`. All transitions 500ms.
- **`WaitlistForm`** — Form with phone input (tel type, placeholder "Your phone number") + submit button (brand-colored). Submit button: `shadow-md hover:shadow-xl hover:scale-[1.03] active:scale-[0.97]` (200ms transitions). UI-only: on submit, shows success message. No API call or Server Action yet.
- **`MobileNav`** — Hamburger toggle, dropdown menu with links (#how-it-works, #themes, #waitlist), closes on navigation
- **`BrandSwitcher`** (dev-only) — Floating switcher for theme selection (4 buttons). Returns `null` when `NODE_ENV !== 'development'`. Dead-codes in production builds. Shows "DEV" label when visible.
- **`StepTimeline`** — Sticky-scroll 4-step timeline using framer-motion entrance animations. **NEW: scroll-driven progress line** with separate `scrollProgress` state (passive scroll listener, respects `reducedMotion`). Progress: gray track + brand-colored fill (height = scrollProgress * 100%) + 4 dots at `(index/(STEPS.length-1))*100%` that fill once scrollProgress reaches them. Fill uses `transition-none` for scroll precision; dots use `transition-all duration-300`. IntersectionObserver (threshold 0.5) on `data-step` still drives `activeStep` for mock panel crossfade (independent of progress line). Desktop: left column scrolls, right column sticky. Mock panels (MockBudget, MockVendors, MockGuests, MockInvitation) accept `{ isActive: boolean; prefersReduced: boolean }`. MockBudget extracts `MockBudgetAnimated` (hooks-only component) to avoid framer-motion hook calls when `prefersReduced=true`. Counter uses `controlsRef` to stop prior animation before starting new one. Panel animations: MockBudget (container fade+slideUp → header/chip stagger → progress bars width fill → counter ₹0→₹8,42,000), MockVendors (container fade+slideUp → vendor rows slide in from the left), MockGuests (container fade → import bar drops in with "247 imported ✓" check → table header → guest rows stagger up → footer fades), MockInvitation (card scale+fade → eyebrow → couple name fade+scale → date/location → event rows stagger → action pills pop → caption fades in last). See source for exact timing.
- **`CountUpStat`** — Animated count-up with range support via `parseValue()` regex (`^([^\d]*?)(\d+)(?:\s*[-–]\s*(\d+))?([^\d]*)$`). Captures prefix/from/to/suffix. Animates both numbers from 0 to target via easeOut. Threshold 0.3. Examples: "20-50", "6-15", "₹15-80L". `parsedRef.current` synced at top of useEffect to avoid stale ref. Respects `prefers-reduced-motion`.
- **`ThemeCarousel`** — Interactive theme selector with preview card + swatch row. **NEW: two-layer gradient crossfade** — framer-motion can't tween CSS gradient strings, so previous gradient animates opacity 1→0 for 600ms while new gradient sits beneath at full opacity. previousGrad state clears after 700ms. Inner content uses `<AnimatePresence mode="wait">` keyed on `selected` for fade+y crossfade. Swatches are `motion.button` with whileHover/whileTap/spring scale + boxShadow. Includes `getGradientTextColor()` helper that parses gradient hex, computes luminance, returns light or dark text. Frosted card bg also adapts. _(Note: same helper exists in StepTimeline — DRY duplication, not yet extracted.)_

## Theme showcase

Themes are imported as `THEMES` and `THEME_NAMES` from `@/lib/themes`, which re-exports from `@repo/shared-types` (shared package). No hardcoded theme data in the page. ThemeCarousel renders dynamically with:
- Selected theme controlled by useState; theme object holds `grad` (CSS gradient), `text` (text color)
- Theme name formatted to title case (kebab-case → "Title Case")
- Vibe description mapped in VIBES record (hardcoded English descriptions per theme)

## Navigation anchors

- Desktop nav and header CTAs all use fragment links
- Section ids: `#how-it-works`, `#themes`, `#waitlist`
- Hero CTA buttons: "Get Early Access" → #waitlist, "See How It Works" → #how-it-works
- Navigation (layout + mobile-nav) links: "How It Works" → #how-it-works, "Themes" → #themes, "Get Early Access" → #waitlist

## WaitlistForm state management

Form is **UI-only**: state in React (`useState` for phone value, submitted flag). On submit, prevents default, sets submitted flag to render success message. No persistence, no API call.

## Styling

- No images; CSS gradients (theme.grad), inline SVG (hamburger menu, X icon), emoji only for decoration
- TickerStrip uses CSS animation (ticker keyframe, 30s linear infinite); inline style tag
- **Particles**: `.particle-container` (absolute inset) + `.particle` spans with `@keyframes particle-fall` (translateY + rotate 720deg; duration set per-particle via inline style). `@media (prefers-reduced-motion: reduce)` disables animation + opacity.
- **Button hover system**: Primary CTAs get `shadow-md hover:shadow-xl hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 cursor-pointer`. Outline CTAs get `hover:shadow-md hover:scale-[1.02] active:scale-[0.98]` + `.btn-outline-hover` (CSS class that adds 5% brand-tint background via `color-mix(in srgb, var(--brand-primary) 5%, transparent)` on hover). Header CTA uses smaller `hover:shadow-lg`.
- **FadeInSection**: opacity + translateY transitions (duration-700) with motion-reduce suppression. Initial: `opacity-0 translate-y-8`. End: `opacity-100 translate-y-0`.
- StepTimeline and CountUpStat use IntersectionObserver + requestAnimationFrame for scroll-triggered animations
- ThemeCarousel uses framer-motion for gradient layer crossfade + inner content fade
- Uses shared design tokens (via BrandProvider in marketing layout)
- Responsive: mobile-first; desktop nav hidden (<md breakpoint), timeline center line hidden on mobile, footer flows to column

## Brand system

- **`apps/web/src/lib/brand.ts`** (NEW) — exports `getActiveBrand()` that reads `process.env.NEXT_PUBLIC_BRAND`, falls back to `'plum'`. Returns `ACTIVE_BRAND` (string) and `brand` (config object). Next.js inlines `NEXT_PUBLIC_*` at build time, so brand is compile-time constant.
- **`NEXT_PUBLIC_BRAND` env var** — values: `plum | wine | sapphire | teal`. Evaluated at build time. Default: `plum`. Sets CSS custom properties via BrandProvider; components reference `var(--brand-primary)`, `var(--brand-light)`, `var(--brand-lighter)`, and `var(--brand-text)`.
- **`BrandSwitcher` dev-only** — in production, returns `null`. In development, provides floating widget to switch themes at runtime (for dev iteration). Dead-codes in production builds.

## Dependencies

- **Runtime**: `framer-motion ^12.38.0` (entrance animations in StepTimeline mock panels, ThemeCarousel gradient crossfade + swatch animations, counter animation via `useMotionValue` + `useMotionTemplate`)
- `@/components/ui/*` — Display, Eyebrow, Chip, Button (from web shell)
- `@/lib/themes` — THEMES map, THEME_NAMES array, ThemeName type (from shared-types); also imported by StepTimeline for MockInvitation panel and ThemeCarousel for theme data
- `@/lib/brand` — ACTIVE_BRAND, brand config (for brand-driven styling)
- React hooks — useState, useEffect, useRef, useLayoutEffect, useCallback, IntersectionObserver, matchMedia (for scroll-aware header, timeline, animations, particle generation)
