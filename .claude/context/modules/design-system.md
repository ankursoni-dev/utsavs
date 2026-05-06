# Design System — Utsavs v3

> Source of truth: `utsavs-design/js/v3/Tokens.jsx` and `Components.jsx`

## Design Philosophy

"Luxury event operating system" — editorial, restrained, jewel-toned. NOT a Pinterest wedding board. Think: Vogue meets Linear.

## Typography

- **Display**: `Marcellus, serif` — used for couple names, section titles, large numbers. Letter-spacing: `-0.02em`.
- **Body**: `Inter, sans-serif` — used for operational text, labels, descriptions.
- **Mono**: `JetBrains Mono, monospace` — code/data displays only.

### Tailwind 4 Mapping

```
fontFamily: {
  display: ['Marcellus', 'serif'],
  sans: ['Inter', 'sans-serif'],
  mono: ['JetBrains Mono', 'monospace'],
}
```

## Color Palette

### Base (Operational)

| Token | Hex | Usage |
|-------|-----|-------|
| bg | `#F7F5F2` | Warm off-white page background |
| bgAlt | `#FBF9F6` | Alternate row/section bg |
| surface | `#FFFFFF` | Cards, panels |
| text | `#171717` | Primary text (near-black) |
| textMuted | `#6B7280` | Secondary text |
| textSubtle | `#9CA3AF` | Tertiary text, placeholders |
| border | `#E7E5E4` | Default borders |
| borderStrong | `#D6D3D1` | Emphasized borders |
| hover | `#F5F4F1` | Row/item hover state |

### Jewel Tones (selective accent use)

| Token | Hex | Context |
|-------|-----|---------|
| emerald | `#0F4C3A` | Modern Emerald theme primary |
| champagne | `#C8A96B` | Gold accent, shagun, premium |
| navy | `#1B1F3B` | Midnight Sangeet primary |
| violet | `#7C3AED` | Sangeet neon accent only |
| maroon | `#5B1A2B` | Temple Classic primary |
| charcoal | `#1A1A1A` | Primary buttons, Minimal Luxury |

### Semantic

| Token | Hex | Usage |
|-------|-----|-------|
| success/healthy | `#0F766E` | Confirmed, done, on-track |
| warning/caution | `#B45309` / `#D97706` | Pending, budget tight |
| danger/critical | `#B91C1C` | Overdue, declined, over-budget |
| info | `#1E40AF` | Informational, countdown |

## 6 Event Themes

Each wedding gets one theme that controls the guest-facing experience:

1. **Royal Ivory** — champagne gold + ivory. Warm, classic. `Marcellus` display.
2. **Modern Emerald** — deep green + gold accent. Fresh, botanical.
3. **Midnight Sangeet** — navy + neon violet/pink. Dark, cinematic, party-mode.
4. **Minimal Luxury** — charcoal + beige. Monochrome, editorial.
5. **Floral Sunset** — peach + rose. Soft, romantic.
6. **Temple Classic** — maroon + brass. Traditional, temple aesthetic.

Each theme provides: `primary`, `secondary`, `accent`, `bg`, `text`, `fontDisplay`, `grad` (gradient), `decor` (decorative style), `motion` (animation intensity).

## Shadow Scale

```
shadowXs: '0 1px 2px rgba(23,23,23,0.04)'
shadowSm: '0 1px 3px rgba(23,23,23,0.06), 0 1px 2px rgba(23,23,23,0.03)'
shadowMd: '0 4px 12px -2px rgba(23,23,23,0.08), 0 2px 6px -2px rgba(23,23,23,0.04)'
shadowLg: '0 12px 28px -6px rgba(23,23,23,0.12), 0 4px 10px -4px rgba(23,23,23,0.06)'
shadowXl: '0 24px 48px -12px rgba(23,23,23,0.18), 0 8px 16px -8px rgba(23,23,23,0.08)'
```

## Motion Tokens

| Token | Value | Use |
|-------|-------|-----|
| fastEase | `cubic-bezier(0.16, 1, 0.3, 1)` | Snappy organizer interactions |
| smoothEase | `cubic-bezier(0.4, 0, 0.2, 1)` | Standard transitions |
| cinematic | `cubic-bezier(0.65, 0, 0.35, 1)` | Guest-facing slow reveals |
| fast | `120ms` | Button hovers, toggles |
| med | `220ms` | Card transitions, modals |
| slow | `420ms` | Section reveals |
| cinema | `720ms` | Cinematic preloads |

## Component Library Reference

### VBtn — 10 variants

`primary` (charcoal), `champagne` (gold), `emerald` (green), `secondary` (white outline), `ghost` (transparent), `outline` (border only), `danger` (red), `glass` (translucent), `serif` (Marcellus font), `loading` (spinner state).

Sizes: `xs` (28h), `sm` (32h), `md` (38h), `lg` (46h), `xl` (54h). Supports `pill`, `icon`, `iconRight`, `fullWidth`.

### VCard — editorial card

White bg, 12px border-radius, subtle shadow. Optional `accent` (top color bar), `hover` (lift on hover).

### VChip — status badge

Maps status strings to semantic colors: Confirmed→green, Pending→amber, Declined→red, VIP→gold, healthy/caution/critical for ops.

### VAvatar — initial-based

Generates 2-letter initials from name. 6-palette rotation. Optional `ring` for emphasis.

### VModal — centered overlay

Backdrop blur, editorial shadow, close button. `modalIn` animation.

### VSidebar — organizer nav

Sticky left sidebar, 220px expanded / 60px collapsed. Supports sections (label groups), dividers, badges.

### VInput — form field

Label (eyebrow style), icon/prefix support, focus ring, error state.

### HealthBar — progress indicator

Thin colored bar. Used for RSVP %, budget %, vendor payment %.

## Spacing

4px base grid: `SP(n)` = `n * 4px`. Standard padding: 16, 20, 24, 32, 40, 80 (sections).

## Implementation Notes for Next.js + Tailwind 4

1. Map tokens directly to Tailwind CSS variables in `@theme` block
2. Create `<ThemeProvider>` that injects event theme as CSS variables on guest pages
3. Organizer pages always use base palette (no theme override)
4. Motion tokens → Tailwind `transition-*` utilities or CSS custom properties
5. Component library translates 1:1 to React Server Components + client interactive wrappers
6. Guest pages need mobile-first responsive design (prototype is desktop-only)
