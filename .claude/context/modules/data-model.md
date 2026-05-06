# Data Model — Prisma 7 ORM

**Purpose:** PostgreSQL schema with 16 models and 14 enums, managed via Prisma 7. Adapter pattern (`@prisma/adapter-pg`) with driver-based connection pooling. Configuration via `prisma.config.ts`, database URL from environment.

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

## Core Entities

| Model | Key Fields | Relations |
|---|---|---|
| **User** | id (cuid), phone (unique), name, email, avatarUrl, createdAt, updatedAt | EventMembership[], events (created), guests, memberships |
| **Event** | id, slug (unique), coupleName, brideName, groomName, weddingDate, venue, city, theme (enum), story, hashtag, state (enum), createdById | createdBy (User), memberships, subEvents, guests, rsvps, shaguns, vendors, budgetItems, tasks, broadcasts, activities |
| **EventMembership** | id, userId, eventId, role (enum: HOST/ORGANIZER/GUEST), permissions (JSON), joinedAt | user, event — composite unique (userId, eventId) |
| **SubEvent** | id, eventId, name, date, time, venue, dressCode, icon, sortOrder | event, deliverables — index on (eventId, sortOrder) |
| **Guest** | id, eventId, userId?, name, phone, side (enum: BRIDE/GROOM), tags[] (array), dietary (enum or null) | event, user, rsvp, shaguns — composite unique (eventId, phone) |
| **Rsvp** | id, guestId (unique), eventId, status (enum), plusOnes, respondedAt | guest, event — index on (eventId, status) |
| **ShagunTransaction** | id, eventId, guestId, amountPaise (int, paise), method (enum), razorpayPaymentId?, razorpayTransferId?, status (enum), settledAt, createdAt | event, guest — index on (eventId, status) |
| **Vendor** | id, eventId, name, type, status (enum), totalAmount, paidAmount, rating, lastContactAt, riskLevel (enum) | event, deliverables, budgetItems — index on (eventId, status) |
| **VendorDeliverable** | id, vendorId, description, subEventId?, completed | vendor, subEvent |
| **BudgetItem** | id, eventId, category, allocated, spent, vendorId? | event, vendor — index on (eventId) |
| **Task** | id, eventId, title, dueDate, status (enum), assigneeName, priority (enum) | event — index on (eventId, status) |
| **Broadcast** | id, eventId, title, body, channel (enum), sentCount, openedCount, createdAt | event — index on (eventId, createdAt) |
| **Activity** | id, eventId, actorType (enum), actorId?, action, metadata (JSON), createdAt | event — index on (eventId, createdAt) |

## Money Convention

All monetary fields are **integers in paise** (not rupees, not float):
- `amountPaise` (ShagunTransaction)
- `totalAmount`, `paidAmount` (Vendor, BudgetItem)
- `allocated`, `spent` (BudgetItem)

Example: ₹11,000 = 1,100,000 paise.

## Enums

| Enum | Values |
|---|---|
| **EventTheme** | ROYAL_IVORY, MODERN_EMERALD, MIDNIGHT_SANGEET, MINIMAL_LUXURY, FLORAL_SUNSET, TEMPLE_CLASSIC |
| **EventState** | BEFORE, DURING, AFTER |
| **MemberRole** | HOST, ORGANIZER, GUEST |
| **GuestSide** | BRIDE, GROOM |
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

## Gotchas and Notes

- **Cascade deletes:** EventMembership, SubEvent, Guest, Rsvp, ShagunTransaction, Vendor, BudgetItem, Task, Broadcast, Activity all have `onDelete: Cascade` from Event. Deleting an event nukes all dependents.
- **Composite indexes:** EventMembership (userId, eventId), SubEvent (eventId, sortOrder), Guest (eventId, phone), Rsvp (eventId, status), ShagunTransaction (eventId, status), Vendor (eventId, status), BudgetItem (eventId), Task (eventId, status), Broadcast (eventId, createdAt), Activity (eventId, createdAt).
- **Optional fields:** avatarUrl, email (User); story, hashtag (Event); dressCode, icon (SubEvent); userId, dietary (Guest); subEventId (VendorDeliverable); rating, lastContactAt, riskLevel (Vendor); vendorId (BudgetItem); dueDate, assigneeName (Task); actorId, metadata (Activity).
- **No explicit timestamps on all models:** only User, Event, Guest (createdAt), ShagunTransaction, Vendor, Task, Broadcast, Activity have timestamps. SubEvent, EventMembership, Rsvp, BudgetItem do not.
