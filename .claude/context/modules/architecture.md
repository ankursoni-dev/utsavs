# Architecture Decisions — Utsavs v3

## Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Monorepo | Turborepo + pnpm | Shared types, parallel builds, incremental caching |
| Backend | NestJS 11 | Module system maps to event domain, guards for role-based access |
| Frontend | Next.js 16 + React 19 | App Router, RSC for guest pages (SEO + perf), Server Actions |
| Styling | Tailwind CSS 4 | CSS-first config, @theme block maps directly to design tokens |
| Database | PostgreSQL 16 | JSONB for flexible metadata, strong relational model for guest/event data |
| ORM | Prisma | Type-safe queries, migrations, relation handling |
| Auth | Phone OTP (MSG91/Twilio) + JWT | India-first: 95%+ users have phone, email optional |
| Payments | Razorpay Route | Only aggregator with zero-MDR UPI P2M + auto-settlement to linked accounts |
| Storage | S3-compatible (Cloudflare R2) | Photos, documents. Presigned URLs for upload. |
| Cache | Redis | Session store, rate limiting, real-time counters |
| Queue | BullMQ (Redis-backed) | Broadcast sending, photo processing, settlement reconciliation |
| Infra | Docker → Railway/Fly.io (v1), AWS (later) | Start simple, migrate when scale demands |

## Key Architecture Decisions

### ADR-001: Phone-first auth, no passwords
Indian wedding guests won't create accounts. OTP via WhatsApp/SMS is frictionless. JWT issued on OTP verify. Guest tokens are scoped to a single event.

### ADR-002: Role-per-event, not global roles
A user can be a guest at one wedding and a host at another. Roles are in the EventMembership join table, not the User table.

### ADR-003: Razorpay Route for shagun
Guest → Razorpay Checkout (Utsavs' merchant) → Razorpay Route → Host's bank account(s).
- UPI P2M = zero MDR (government mandate)
- Card/NetBanking = convenience fee shown to guest at checkout
- Server-confirmed via webhooks, not client redirect
- Supports multi-bank split (bride family + groom family accounts)
- Future revenue: 0.5% platform fee at scale on shagun GMV

### ADR-004: Theme as data, not separate codepaths
Guest pages render from a single codebase. The event's `theme` field (enum of 6 values) selects a token set that's injected as CSS variables via ThemeProvider. No theme-specific components.

### ADR-005: Event state machine
Events have 3 states: `before` (planning), `during` (live day), `after` (post-wedding). The guest page adapts: countdown → live timeline → photo gallery + shagun summary.

### ADR-006: Organizer ≠ Host
Organizer = professional wedding planner (multi-event, command center, health dashboard).
Host = the couple/family (single-event, emotional, simplified).
Same backend, different frontend shells. Host sees a curated subset of organizer features.

### ADR-007: Broadcast via WhatsApp first
Indian families communicate via WhatsApp, not email. Broadcast system sends via WhatsApp Business API (primary), SMS (fallback), push (app users). Template messages for RSVP reminders, venue updates, dress code.

### ADR-008: Guest page is a PWA
Guest event page works as an installable PWA. No app store needed. Add to home screen → instant access to schedule, RSVP status, live timeline, photo upload.

## Module Structure (NestJS)

```
apps/api/src/modules/
├── auth/           # OTP, JWT, guards
├── users/          # User CRUD, profile
├── events/         # Event CRUD, state machine, theme
├── sub-events/     # Sub-event management
├── guests/         # Guest list, import (CSV/contacts), search
├── rsvp/           # RSVP submission, status tracking
├── shagun/         # Razorpay integration, settlement, reconciliation
├── vendors/        # Vendor management, risk scoring
├── budget/         # Budget tracking, category management
├── tasks/          # Task CRUD, assignment, overdue detection
├── broadcasts/     # WhatsApp/SMS sending, template management
├── photos/         # Upload (presigned URLs), gallery, albums
├── timeline/       # Live day timeline, event state transitions
├── analytics/      # Computed stats, health scoring, AI suggestions
├── notifications/  # In-app notifications, push
├── ai/             # AI suggestions engine, smart nudges
```

## Next.js Route Structure

```
apps/web/src/app/
├── (marketing)/         # Landing page, waitlist, pricing
│   ├── page.tsx
│   └── layout.tsx
├── (auth)/              # OTP login, verify
│   ├── login/
│   └── verify/
├── (organizer)/         # Organizer shell (sidebar + topbar)
│   ├── layout.tsx
│   ├── overview/
│   ├── events/
│   ├── guests/
│   ├── vendors/
│   ├── budget/
│   ├── tasks/
│   ├── broadcasts/
│   └── analytics/
├── (host)/              # Host shell (simplified, emotional)
│   ├── layout.tsx
│   ├── dashboard/
│   ├── guests/
│   ├── shagun/
│   └── checklist/
├── e/[slug]/            # Guest event page (public, themed)
│   ├── page.tsx         # Main event page (SSR for SEO)
│   ├── rsvp/
│   ├── gallery/
│   └── shagun/
└── api/                 # Next.js API routes (BFF if needed)
```

## Docker Architecture

### Local Dev — `docker compose up` is the only command

Developers never run `pnpm dev` directly. Everything goes through Docker Compose.

```
compose.yaml (local dev):
  services:
    api:       apps/api via docker/api.Dockerfile (dev target, volume-mounted source, hot reload)
    web:       apps/web via docker/web.Dockerfile (dev target, volume-mounted source, hot reload)
    postgres:  postgres:16-alpine, port 5432, volume for data persistence
    redis:     redis:7-alpine, port 6379
```

### How shared-types works in Docker

`packages/shared-types` is a workspace dependency, NOT a runtime service. During Docker build:
1. `turbo prune <app> --docker` extracts only the files needed for that app + its workspace deps
2. `pnpm install` links `@repo/shared-types` as a workspace dependency
3. `turbo build --filter=<app>` compiles shared-types first, then the app absorbs the compiled output
4. Final image contains only compiled JS — no shared-types source

### Dockerfile pattern (multi-stage)

```
# Stage 1: turbo prune (extracts minimal workspace subset)
# Stage 2: install deps (cached layer — only re-runs when package.json changes)
# Stage 3: build (compiles app + shared deps)
# Stage 4: production runner (slim image, only compiled output + prod node_modules)
```

Dev target stops at Stage 2 and volume-mounts source code for hot reload.

### File layout

```
utsavs/
├── docker/
│   ├── api.Dockerfile
│   └── web.Dockerfile
├── compose.yaml          # Local dev (default)
├── compose.prod.yaml     # Production overrides
```

## Security

- Rate limiting: 5 OTP requests per phone per hour
- JWT: short-lived access (15min) + long-lived refresh (30 days)
- Event access: guest token scoped to single event, cannot access other events
- Shagun amounts: visible only to host + organizer with `view_shagun` permission
- Photo uploads: max 10MB, EXIF stripped, thumbnails generated async
- CORS: guest pages on `*.utsavs.in`, API on `api.utsavs.in`

## ADR-009: Config-driven OTP providers (phased)

**M0 (now):** OtpProvider interface + factory. Credentials from env vars (MSG91_AUTH_KEY). Factory picks DevOtpProvider (console log fallback) vs Msg91OtpProvider based on env var presence. FixedOtp table for dev/QA/app-store-review — checked before provider, before rate limiting.

**M1 (planned):** Add `CommunicationProvider` table to Prisma schema:
- `channel` (SMS | WHATSAPP | EMAIL), `name` ("msg91", "twilio", "gupshup"), `isActive`, `priority` (failover ordering), `credentials` (encrypted JSON — AES-256-GCM at app layer, key from CRED_ENCRYPT_KEY env var), `config` (JSON — rate limits, templates)
- Factory switches from "read env var" to "read CommunicationProvider table" — one file change, zero impact on auth service or controller
- In-memory cache loaded at startup, 5-minute TTL refresh. DB down? Cached config still works.
- Each provider defines its own credential shape (MSG91: authKey/senderId/templateId, Twilio: accountSid/authToken/serviceSid). Validated at app layer when provider class parses it.

**The interface is the abstraction boundary.** Auth service calls `otpProvider.sendOtp()` and never knows where the credentials came from or which provider is active.

### ADR-010: Route naming — debug-friendly last segments

Every API route's last path segment must be self-descriptive in a browser network tab. No generic segments like `/me`, `/request`, `/verify`, `/status`, `/list`. Examples: `/auth/otp-request` (not `/auth/otp/request`), `/auth/otp-verify`, `/auth/token-refresh`. Nested resource routes like `/events/:id/guests` are acceptable since the parent provides context, but action sub-routes must be qualified (e.g., `/events/:id/guest-import` not `/events/:id/import`).

### ADR-011: User entry flows and auth scope

- **Host**: signs up via phone OTP → creates event → EventMembership(role: HOST, createdById: self)
- **Co-host**: invited by host via WhatsApp link containing invite token → phone OTP → EventMembership(role: HOST) auto-created. Multiple HOSTs per event supported. No separate COHOST role.
- **Organizer** (wedding planner): invited by host → phone OTP or Google SSO → EventMembership(role: ORGANIZER)
- **Guest**: gets event link (e/{slug}) via WhatsApp → event page is PUBLIC (no auth). Phone OTP required only for RSVP and shagun.
- **Vendor**: data rows managed by host. No login, no EventMembership. Vendor portal is M3+.
- **Org/Admin**: Google SSO or email OTP to admin panel. Separate concern from user-facing auth.

Auth module handles authentication ("who are you"). EventMembership handles authorization ("what can you do here"). Profile endpoint belongs in users module, not auth.

## Performance Targets

- Guest page first paint: < 1.5s on 4G
- RSVP submission: < 500ms
- Photo upload: < 3s for 5MB image
- Organizer dashboard load: < 2s with 500 guests
