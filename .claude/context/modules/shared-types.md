# @repo/shared-types

**Package**: `packages/shared-types`

## Purpose

Single source of truth for TypeScript enums and theme tokens shared across the NestJS backend (apps/api/) and Next.js frontend (apps/web/). Enums are implemented as runtime-available `const` objects with nominal type unions — this avoids TypeScript `enum` emit overhead while keeping values serializable. String values in enums MUST match the Prisma enum values in `apps/api/prisma/schema.prisma`.

## Exports

### Enums (14 total, as const objects + types)

| Name | Values |
|---|---|
| **EventType** | WEDDING, BIRTHDAY, ANNIVERSARY, RETIREMENT, CUSTOM |
| **EventTheme** | ROYAL_IVORY, MODERN_EMERALD, MIDNIGHT_SANGEET, MINIMAL_LUXURY, FLORAL_SUNSET, TEMPLE_CLASSIC |
| **EventState** | BEFORE, DURING, AFTER |
| **MemberRole** | HOST, ORGANIZER, GUEST |
| **DietaryPreference** | VEG, NON_VEG, JAIN, VEGAN |
| **RsvpStatus** | CONFIRMED, PENDING, DECLINED, MAYBE |
| **PaymentMethod** | UPI, CARD, NET_BANKING, CASH |
| **TransactionStatus** | INITIATED, CAPTURED, SETTLED, FAILED |
| **VendorStatus** | CONFIRMED, PENDING, REJECTED |
| **RiskLevel** | LOW, MEDIUM, HIGH |
| **TaskStatus** | PENDING, DONE, OVERDUE |
| **Priority** | HIGH, MEDIUM, LOW |
| **BroadcastChannel** | WHATSAPP, SMS, PUSH |
| **ActorType** | GUEST, HOST, SYSTEM |

### Themes (6 themed CSS token sets)

**ThemeName** (union): `'royal-ivory' | 'modern-emerald' | 'midnight-sangeet' | 'minimal-luxury' | 'floral-sunset' | 'temple-classic'`

**ThemeTokens** (shape): `{ primary, secondary, accent, bg, text, grad }` — all string values (colors or CSS gradients).

**THEMES** object: `Record<ThemeName, ThemeTokens>` with complete token set for each theme. Guest-facing only; organizer shells render base palette.

## Usage

**Backend (NestJS)**
```typescript
import { EventType, RsvpStatus, Priority } from '@repo/shared-types';
```

**Frontend (Next.js)**
```typescript
import { THEMES, type ThemeName } from '@repo/shared-types';
// apps/web/src/lib/themes.ts is now a thin re-export of this module
```

## Critical contract

The string values in `enums.ts` are the runtime constants used by both the backend (database inserts, API responses) and frontend (form validation, display logic). **Every enum value MUST be synchronized with the corresponding Prisma enum in `apps/api/prisma/schema.prisma`.** When adding or removing an enum value, update both files.

## Dependencies

None — this is a leaf package. Used by `apps/api/` and `apps/web/`.
