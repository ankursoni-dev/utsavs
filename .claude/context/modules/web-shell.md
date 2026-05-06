# Web Shell — Next.js 16 Frontend

## Purpose

Scaffolded Next.js 16 application for Utsavs frontend. Houses the editorial, jewel-toned UI shell for three user cohorts: guests (public event pages), organizers (command center), and hosts (simplified couple dashboard). Driven by tokens injected via ThemeProvider; guest pages render with event-specific themes.

## Docker dev workflow

Single entry point: `docker compose up -d api web postgres redis && sleep 5`. The `web` service mounts source under `/app/apps/web/src`, `/app/apps/web/public`, config files, and `@repo/shared-types` from packages. Dev target runs `pnpm --filter web dev` — hot reload on save.

Volume mounts: `./apps/web/src`, `./apps/web/public`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `packages/shared-types/src`. Access at `http://localhost:3000`.

## Design tokens (globals.css)

All tokens are CSS custom properties. Token names referenced in Tailwind's `@theme inline` block and via inline `var(--name)` in components.

**Base palette (operational):** `--color-bg`, `--color-bg-alt`, `--color-surface`, `--color-text`, `--color-text-muted`, `--color-text-subtle`, `--color-border`, `--color-border-strong`, `--color-hover`.

**Jewel tones:** `--color-emerald`, `--color-emerald-lt`, `--color-champagne`, `--color-champagne-lt`, `--color-navy`, `--color-navy-lt`, `--color-violet`, `--color-maroon`, `--color-brass`, `--color-peach`, `--color-rose`, `--color-beige`, `--color-charcoal`.

**Semantic (ops):** `--color-success`, `--color-success-bg`, `--color-warning`, `--color-warning-bg`, `--color-danger`, `--color-danger-bg`, `--color-info`, `--color-info-bg`. Health: `--color-healthy`, `--color-caution`, `--color-critical`, `--color-neutral`.

**Shadows (5 levels):** `--shadow-xs`, `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`.

**Motion:** `--ease-fast`, `--ease-smooth`, `--ease-cinematic`. Durations: `--duration-fast` (120ms), `--duration-med` (220ms), `--duration-slow` (420ms), `--duration-cinema` (720ms).

**Radii:** `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-2xl`.

## Fonts & typography

Layout.tsx injects three Google Fonts as CSS variables: `--font-marcellus` (display, weight 400), `--font-inter` (sans, default weight), `--font-jetbrains-mono` (monospace). Body uses `--font-sans` by default. Display headings via `Display` component use `--font-display` with fixed letter-spacing `-0.02em`. Eyebrow labels use small-caps styling.

## ThemeProvider

Guest-facing pages wrap subtrees with `<ThemeProvider theme={event.theme}>` where theme is one of: `royal-ivory`, `modern-emerald`, `midnight-sangeet`, `minimal-luxury`, `floral-sunset`, `temple-classic`. Provider injects 6 CSS variables: `--theme-primary`, `--theme-secondary`, `--theme-accent`, `--theme-bg`, `--theme-text`, `--theme-grad`. Guest components read these vars. Organizer/host shells do not use themes — they read base palette directly.

## `cn()` utility

Located at `/apps/web/src/lib/utils.ts`. Signature: `cn(...inputs: ClassValue[]): string`. Merges clsx (conditional class strings) + twMerge (deduplicates Tailwind utilities). Import in every UI component.

## UI primitives quick-ref

| Component | Path | Key props |
|-----------|------|-----------|
| Button | `components/ui/button.tsx` | `variant` (primary, champagne, emerald, secondary, ghost, outline, danger, glass, serif), `size` (xs–xl), `pill`, `fullWidth`, `iconLeft`, `iconRight`, `loading` |
| Card | `components/ui/card.tsx` | `accent` (color string), `hover`. Sub-exports: `CardBody`, `CardHeader`, `CardFooter` |
| Chip | `components/ui/chip.tsx` | `status` (confirmed, pending, declined, maybe, vip, healthy, caution, critical, neutral, success, warning, danger, info), `dense` |
| Avatar | `components/ui/avatar.tsx` | `name` (required), `src` (optional image), `size` (xs–xl), `ring` (VIP border) |
| Display | `components/ui/display.tsx` | `size` (sm–2xl), `as` (h1–h4). Marcellus heading with fixed letter-spacing. |
| Eyebrow | `components/ui/eyebrow.tsx` | Standard HTMLAttributes. Small-caps uppercase label. |

## Route groups

Organized by cohort via `(group)` folders. Each group has its own layout.

| Group | Layout path | Example URLs | Purpose |
|-------|-------------|--------------|---------|
| (marketing) | — (root layout only) | `/` | Landing, waitlist, pricing |
| (auth) | `(auth)/layout.tsx` | `/login`, `/verify` | OTP & verification |
| (organizer) | `(organizer)/layout.tsx` | `/overview`, `/events`, `/guests`, `/vendors`, `/budget`, `/tasks`, `/broadcasts`, `/analytics` | Professional planner command center |
| (host) | `(host)/layout.tsx` | `/dashboard`, `/guests`, `/shagun`, `/checklist` | Couple/family simplified view |
| e/[slug] | — (dynamic) | `/e/smith-wedding-2025/`, `/e/smith-wedding-2025/rsvp`, `/e/smith-wedding-2025/gallery`, `/e/smith-wedding-2025/shagun` | Public guest event page (themed) |

Guest pages (`e/[slug]/...`) are server-rendered for SEO. All routes use typed routes (Next.js 16 feature).

## Build & deployment

Next.js config: `output: 'standalone'` bundles only runtime artifacts. `outputFileTracingRoot` points to monorepo root so Prisma clients + workspace deps are traced into the bundle. Production Dockerfile stages: prune → install → build → slim runner (copies `.next/standalone` + static assets). Dev target stops at stage 2, hot-reloads via volume mounts.

## See also

- [design-system.md](design-system.md) — token values, color palette, 6 event themes
- [architecture.md](architecture.md) — route structure, role-per-event model, guest/organizer/host shells
