# Marketing Page Module

## Purpose

Landing page at `/` (route group `(marketing)`): acquisition page for Utsavs with 6 sections, waitlist signup, and theme showcase. No backend integrations yet.

## Route and structure

- **Route group**: `apps/web/src/app/(marketing)/`
- **Renders at**: `/` (root)
- **6 sections** (in order):
  1. **Hero** — tagline "Your Wedding, Orchestrated", CTA buttons to #waitlist and #features, scroll indicator
  2. **Problem** (id: `#problem`) — 3 cards (Communication Chaos, Budget Blindspots, Vendor Anxiety) with emoji, title, description
  3. **Solution / Features** (id: `#features`) — 6 feature cards (Guest Management, Budget & Shagun, Vendor Coordination, Event Timeline, Multi-Host Collaboration, Digital Invitations) with color accent bars
  4. **Theme Showcase** (id: `#themes`) — 6 curated themes displayed as gradient cards (royal-ivory, modern-emerald, midnight-sangeet, minimal-luxury, floral-sunset, temple-classic), scrollable on mobile, 3-column grid on desktop
  5. **Stats** — 500+ signups, 6 themes, ∞ memories (UI-only, no analytics)
  6. **Waitlist CTA** (id: `#waitlist`) — heading + form + reassurance text

## Component breakdown

### Server Components (marketing group layout)
- **`layout.tsx`** — Sticky header with logo, desktop nav links (#features, #themes), CTA button; footer with links
- **`page.tsx`** — Root landing page; orchestrates all 6 sections, imports THEMES from shared, renders cards from inline data

### Client Components
- **`WaitlistForm`** — "use client"; form with phone input (tel type, placeholder "+91 98765 43210") + submit button (variant="champagne"). Currently UI-only: on submit, shows success message ("You're on the list. 🎉"). No API call or Server Action yet.
- **`MobileNav`** — "use client"; hamburger toggle, dropdown menu with links (#features, #themes, #waitlist), closes on navigation
- **`ScrollIndicator`** — Static, renders animated chevron + "Scroll" label in hero section; no interaction

## Theme showcase

Themes are imported as `THEMES` and `THEME_NAMES` from `@/lib/themes`, which re-exports from `@repo/shared-types` (shared package). No hardcoded theme data in the page. Theme cards render dynamically with:
- `tokens.grad` (CSS gradient from theme token map) as background
- Theme name (kebab-case, converted to Title Case with spaces)
- Vibe description (hardcoded mapping in `getThemeVibe()` helper)

## Navigation anchors

- Desktop nav and header CTAs all use fragment links (`href="#features"`, `href="#themes"`, `href="#waitlist"`)
- Section ids: `#problem`, `#features`, `#themes`, `#waitlist`
- Hero has explicit buttons linking to these anchors

## WaitlistForm state management

Form is **UI-only**: state in React (`useState` for phone value, submitted flag). On submit, prevents default, sets submitted flag to render success message. No persistence, no API call.

**Future work**: When backend lands, add Server Action or fetch to POST phone to a waitlist endpoint. Response envelope TBD.

## Styling

- No images; CSS gradients (`style={{ background: tokens.grad }}`), inline SVG (hamburger menu, scroll chevron, X icon), emoji only for decoration
- Uses shared design tokens (via ThemeProvider in web shell)
- Responsive: mobile-first; desktop nav hidden (<md breakpoint), footer flows to column on mobile
- Color variables: `var(--color-emerald)`, `var(--color-champagne)`, `var(--color-charcoal)`, `var(--color-maroon)` referenced in feature cards

## Dependencies

- `@/components/ui/*` — Display, Eyebrow, Card, CardBody, Button (from web shell)
- `@/lib/themes` — THEMES map, THEME_NAMES array (from shared-types)
- `next/navigation` — implicit via layout/page structure
