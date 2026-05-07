# Data Model — Prisma 7 ORM

**Purpose:** PostgreSQL schema managed via Prisma 7. Event-type-agnostic core with type-specific detail tables (only WeddingDetail built for launch). Adapter pattern (`@prisma/adapter-pg`) with driver-based connection pooling.

## Prisma Setup

- **Version:** 7 (not 6 — adapter-based architecture)
- **Config file:** `prisma.config.ts` (Prisma 7 convention; datasource URL external)
- **Schema:** `prisma/schema.prisma`
- **Adapter:** `@prisma/adapter-pg` (required for Prisma 7)
- **Connection:** `new PrismaPg({ connectionString: process.env.DATABASE_URL })`
- **Service:** `PrismaService` extends `PrismaClient`, lifecycle hooks (`OnModuleInit`, `OnModuleDestroy`), global module
- **Injection:** `constructor(private prisma: PrismaService)` in NestJS services
- **Migrations:** `docker compose exec api npx prisma migrate dev --name <name>`
- **Seed:** `docker compose exec api npx prisma db seed` (runs `prisma/seed.ts`)

## Architecture: Generic Event + Type-Specific Details

The Event table is **type-agnostic**. Wedding-specific fields live in WeddingDetail (1:1). Future event types (birthday, anniversary, retirement) get their own detail tables when built — not before.

```
Event (generic: name, date, venue, city, type, state, theme)
  └── WeddingDetail (1:1, only when type=WEDDING)
        partner1Name, partner1Label ("Bride"), partner2Name, partner2Label ("Groom")
        coupleName, story, hashtag
```

Guest.group is a free-form nullable String — not an enum. For weddings, values are "Bride"/"Groom" (or custom labels for same-sex weddings). For birthdays, null or "Family"/"Friends". The frontend derives default group labels from WeddingDetail partner labels.

## Core Entities

| Model | Key Fields | Relations |
|---|---|---|
| **User** | id (cuid), phone (unique), name, email, avatarUrl, createdAt, updatedAt | memberships[], events (created), guests |
| **Event** | id, slug (unique), **name**, **type** (enum), date (DateTime), venue, city, theme (enum), state (enum), createdById | createdBy (User), weddingDetail?, memberships, subEvents, guests, rsvps, contributions, vendors, budgetItems, tasks, broadcasts, activities |
| **WeddingDetail** | id, **eventId (unique FK)**, partner1Name, partner1Label?, partner2Name, partner2Label?, coupleName?, story?, hashtag? | event |
| **EventMembership** | id, userId, eventId, role (enum: HOST/ORGANIZER/GUEST), permissions (JSON), joinedAt | user, event — composite unique (userId, eventId) |
| **SubEvent** | id, eventId, name, date, time, venue, dressCode, icon, sortOrder | event, deliverables — index on (eventId, sortOrder) |
| **Guest** | id, eventId, userId?, name, phone, **group (String?)**, tags[] (array), dietary (enum or null) | event, user, rsvp, contributions — composite unique (eventId, phone) |
| **Rsvp** | id, guestId (unique), eventId, status (enum), plusOnes, respondedAt | guest, event — index on (eventId, status) |
| **Contribution** | id, eventId, guestId, amountPaise (int), method (enum), **label (String?)**, **paymentId?**, **transferId?**, status (enum), settledAt, createdAt | event, guest — index on (eventId, status) |
| **Vendor** | id, eventId, name, type, status (enum), totalAmount, paidAmount, rating, lastContactAt, riskLevel (enum) | event, deliverables, budgetItems — index on (eventId, status) |
| **VendorDeliverable** | id, vendorId, description, subEventId?, completed | vendor, subEvent |
| **BudgetItem** | id, eventId, category, allocated, spent, vendorId? | event, vendor — index on (eventId) |
| **Task** | id, eventId, title, dueDate, status (enum), assigneeName, priority (enum) | event — index on (eventId, status) |
| **Broadcast** | id, eventId, title, body, channel (enum), sentCount, openedCount, createdAt | event — index on (eventId, createdAt) |
| **Activity** | id, eventId, actorType (enum), actorId?, action, metadata (JSON), createdAt | event — index on (eventId, createdAt) |

## Key Changes from v1 Schema

- **Event** is now generic: `name` instead of `coupleName`, `type` field added, wedding fields moved out
- **WeddingDetail** is new: 1:1 with Event, holds partner names/labels, story, hashtag. Supports same-sex weddings via customizable labels.
- **Guest.side** → **Guest.group** (String?, nullable, free-form — not an enum)
- **GuestSide enum** → deleted
- **ShagunTransaction** → renamed to **Contribution** (generic gifting across event types)
- **Contribution.label** → "Shagun" for weddings, "Gift" for birthdays, custom
- **razorpayPaymentId** → **paymentId** (payment-gateway-agnostic)
- **razorpayTransferId** → **transferId** (payment-gateway-agnostic)
- **EventType** → new enum: WEDDING, BIRTHDAY, ANNIVERSARY, RETIREMENT, CUSTOM

## Money Convention

All monetary fields are **integers in paise** (not rupees, not float):
- `amountPaise` (Contribution)
- `totalAmount`, `paidAmount` (Vendor)
- `allocated`, `spent` (BudgetItem)

Example: ₹11,000 = 1,100,000 paise.

## Enums

| Enum | Values |
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

## Shared Types (packages/shared-types)

These enums and theme token maps are shared between Prisma (backend) and the frontend:
- All enums above → `packages/shared-types/src/enums.ts`
- Theme token maps (6 palettes) → `packages/shared-types/src/themes.ts`
- Prisma enum values MUST match shared-types values exactly

## Gotchas and Notes

- **Cascade deletes:** All child tables cascade from Event. Deleting an event nukes all dependents.
- **WeddingDetail is 1:1:** eventId is unique FK. Only one detail row per event.
- **Guest.group is NOT an enum:** free-form string allows "Bride", "Groom", "Priya's Family", "Friends", null, anything.
- **Contribution.label is display-only:** the frontend defaults it based on EventType but the host can customize.
- **paymentId/transferId are gateway-agnostic:** no "razorpay" prefix. If we switch gateways, no migration needed.
