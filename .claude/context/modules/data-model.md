# Data Model — Utsavs v3

> Derived from: `utsavs-design/js/v3/Data.jsx` and Product Execution Plan

## Core Entities

### User
- Phone-first auth (OTP via MSG91/Twilio)
- Roles: `guest`, `host`, `organizer` (role per event, not global)
- Fields: id, phone, name, email?, avatar_url?, created_at

### Event
- Central entity. One couple, multiple sub-events.
- Fields: id, slug, couple_name, bride_name, groom_name, wedding_date, venue, city, theme (enum: 6 themes), story, hashtag, state (before/during/after), created_by (host user_id)
- Stats (computed/cached): total_guests, confirmed, pending, declined, maybe, shagun_total, photos_uploaded, budget_total, budget_spent, tasks_total, tasks_done

### SubEvent
- Belongs to Event. Mehendi, Sangeet, Haldi, Wedding, Reception, custom.
- Fields: id, event_id, name, date, time, venue, dress_code, icon, sort_order

### Guest
- Belongs to Event. Invited person (may or may not be a User).
- Fields: id, event_id, user_id?, name, phone, side (Bride/Groom), tags[] (VIP, Family, Friend, Colleague, College...), dietary (Veg/Non-Veg/Jain/null)
- RSVP is per-guest (not per sub-event in v1)

### RSVP
- Fields: id, guest_id, event_id, status (Confirmed/Pending/Declined/Maybe), plus_ones (int), responded_at
- v2 scope: per-sub-event RSVP, meal preference per sub-event

### ShagunTransaction
- Fields: id, event_id, guest_id, amount (paise), method (UPI/Card/NetBanking/Cash), razorpay_payment_id?, razorpay_transfer_id?, status (initiated/captured/settled/failed), created_at, settled_at
- Settlement: Razorpay Route auto-settles to host's linked bank account(s)
- UPI = zero MDR (P2M). Card/NetBanking = convenience fee passed to guest.

### Vendor
- Fields: id, event_id, name, type (Photographer/Decorator/Caterer/DJ/Mehendi/Florist/...), status (Confirmed/Pending/Rejected), total_amount, paid_amount, rating, last_contact_at, risk_level (low/medium/high)
- Has many Deliverables: { vendor_id, description, sub_event_id?, completed }

### BudgetItem
- Fields: id, event_id, category (Venue/Catering/Decoration/Photography/Outfits/Music/Misc), allocated, spent, vendor_id?

### Task
- Fields: id, event_id, title, due_date, status (pending/done/overdue), assignee_name, priority (high/medium/low)

### Broadcast
- Fields: id, event_id, title, body, sent_count, opened_count, channel (WhatsApp/SMS/Push), created_at

### Activity (event log)
- Fields: id, event_id, actor_type (guest/host/system), actor_id?, action, metadata (JSON), created_at
- Examples: RSVP confirmed, shagun received, photo uploaded, vendor responded, task completed

## Relationships

```
User 1──M EventMembership M──1 Event
Event 1──M SubEvent
Event 1──M Guest
Guest 1──1 RSVP (v1, 1──M in v2)
Guest 1──M ShagunTransaction
Event 1──M Vendor
Vendor 1──M Deliverable
Event 1──M BudgetItem
Event 1──M Task
Event 1──M Broadcast
Event 1──M Activity
```

EventMembership: { user_id, event_id, role: host|organizer|guest, permissions: JSON }

## Multi-Event Support (Organizer)

An organizer (wedding planner) manages multiple events. The command center shows:
- Event list with health status (healthy/caution/critical)
- Aggregate alerts across events
- Per-event: days_left, rsvp_pct, budget_pct, vendor_count

Health is computed: critical if (days_left < 14 AND pending > 20%) OR budget > 95% OR any vendor risk=high.

## Shagun Payment Architecture

- Guest pays via Razorpay Checkout (embedded in guest page)
- Payment goes to Utsavs' Razorpay merchant account (P2M UPI = zero MDR)
- Razorpay Route auto-transfers to host's linked bank account(s)
- Host can link multiple bank accounts (split across family members)
- Convenience fee on card/net banking passed to guest (like BookMyShow)
- Server-confirmed via Razorpay webhooks (not client-side redirect)

## Data Scale Assumptions (v1)

- Events: 100-500 active
- Guests per event: 200-800
- Sub-events per event: 3-7
- Vendors per event: 8-20
- Shagun transactions per event: 50-300
- Photos per event: 500-5000
