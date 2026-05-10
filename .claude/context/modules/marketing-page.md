# Marketing Page Module

## Purpose

Landing page at `/` (route group `(marketing)`): acquisition page for Utsavs with 6 sections, waitlist signup, and theme showcase. No backend integrations yet.

## Route and structure

- **Route group**: `apps/web/src/app/(marketing)/`
- **Renders at**: `/` (root)
- **6 sections** (in order):
  1. **Hero** — tagline "Stop running weddings on WhatsApp", CTA buttons to #waitlist and #how-it-works, TickerStrip of features below
  2. **How It Works** (id: `#how-it-works`) — 4-step timeline with mock UI panels: Budget & Shagun, Vendor Command, Guest Intelligence, Themed Experiences
  3. **Organizer Advantage** (dark charcoal section) — 3 CountUpStat cards (20-50 weddings/year, 6-15 vendors/wedding, ₹15-80L budget range)
  4. **Theme Showcase** (id: `#themes`) — interactive carousel: select from 6 curated themes, preview card + swatch row
  5. **Building in Public** (no id) — milestone list with checkmark/progress/coming-soon indicators (Auth & guest mgmt shipped, 6 themes shipped, Budget & shagun in progress, Vendor coordination coming soon)
  6. **Waitlist CTA** (id: `#waitlist`) — heading + form + reassurance text

## Component breakdown

### Server Components
- **`layout.tsx`** — Sticky header with logo, desktop nav links (#how-it-works, #themes), CTA button; footer with links
- **`page.tsx`** — Root landing page; orchestrates all 6 sections, imports THEMES from shared
- **`TickerStrip`** — Horizontally scrolling ticker with feature list (◆ separator); respects prefers-reduced-motion

### Client Components
- **`WaitlistForm`** — Form with phone input (tel type, placeholder "Your phone number") + submit button. UI-only: on submit, shows success message. No API call or Server Action yet.
- **`MobileNav`** — Hamburger toggle, dropdown menu with links (#how-it-works, #themes, #waitlist), closes on navigation
- **`StepTimeline`** — 4-step timeline with mock UI panels; viewport-triggered reveal with IntersectionObserver; center vertical line (desktop only)
- **`CountUpStat`** — Animated count-up for integer values (or static display for non-integers); viewport-triggered animation with easeOut; respects prefers-reduced-motion
- **`ThemeCarousel`** — Interactive theme selector with preview card (responsive size) + swatch row; selected theme controls background gradient and text color

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

**Future work**: When backend lands, add Server Action or fetch to POST phone to a waitlist endpoint. Response envelope TBD.

## Styling

- No images; CSS gradients (theme.grad), inline SVG (hamburger menu, X icon), emoji only for decoration
- TickerStrip uses CSS animation (ticker keyframe, 30s linear infinite); inline style tag
- StepTimeline and CountUpStat use IntersectionObserver + requestAnimationFrame for scroll-triggered animations
- ThemeCarousel uses CSS transitions for theme preview updates
- Uses shared design tokens (via ThemeProvider in web shell)
- Responsive: mobile-first; desktop nav hidden (<md breakpoint), timeline center line hidden on mobile, footer flows to column

## Dependencies

- `@/components/ui/*` — Display, Eyebrow, Chip, Button (from web shell)
- `@/lib/themes` — THEMES map, THEME_NAMES array, ThemeName type (from shared-types); also imported by StepTimeline for MockInvitation panel
- React hooks — useState, useEffect, useRef, IntersectionObserver, requestAnimationFrame (for animations and scroll-triggered reveals)
