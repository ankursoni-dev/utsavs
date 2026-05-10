# Pipeline Prompts — Utsavs M0 Foundation

> These prompts are designed for the Claude Code agent pipeline.
> Paste each prompt sequentially into Claude Code running in the utsavs project root.
> This session (Cowork) reviews the output after each prompt.

## Prompt Sequence

1. M0-P1: Docker + Tailwind Design System + Route Scaffold (cross-stack)
2. M0-P2: Prisma Schema + Database Setup (NestJS)
3. M0-P3: Auth Module — Phone OTP + JWT (NestJS)
4. M0-P4: Landing Page (Next.js)
5. M0-P5: CI/CD — GitHub Actions (Config)

---

## Status Tracker

| Prompt | Status | Notes |
|--------|--------|-------|
| M0-P1 | ✅ DONE | Docker + Tailwind + Route Scaffold (MASTER) |
| M0-P2 | ✅ DONE | Prisma Schema + Seed + Restructure (MASTER) |
| M0-P3 | ✅ DONE | Auth Module — Phone OTP + JWT (multi-strategy, fixed OTP, config-driven providers, Bruno collection, optimized) |
| M0-P4 | ✅ DONE (v1) | Landing Page v1 — shipped but needs redesign (copy too generic, no animation, no mock UIs) |
| M0-P4v2 | READY | Landing Page v2 — full redesign with scroll-triggered timeline, mock UI panels, organizer-first copy. Prompt: `M0-P4-v2-landing-page-redesign.md` |
| M0-P5 | PENDING | CI/CD — GitHub Actions |

---

## Future Milestones (post-M0)

| Item | Priority | Description |
|------|----------|-------------|
| **Interactive Demo Flow** | HIGH | Guided product tour with sample data (like Phera's demo dashboard). Visitor clicks "Try the Demo" → lands in a sandbox with pre-populated wedding data (guests, budget, vendors, timeline). No login required. Shows the product better than any landing page copy. This is a conversion driver — organizers want to *feel* the tool, not read about it. Requires: demo data seed, read-only sandbox mode, guided tour overlay with step indicators. Target: M1 or M2. |
| **Real Assets & Illustrations** | MEDIUM | The v2 landing page uses HTML/CSS mock UI panels (no images). Eventually need: proper logo mark (not just wordmark), custom illustrations for empty states, hero imagery or video, social proof photos. Consider commissioning or using AI-generated illustrations that match the brand aesthetic (jewel-toned, editorial, Indian wedding motifs — NOT stock photos of generic couples). |
| **Landing Page Video/Animation** | LOW | A short (30-60s) product walkthrough video or Lottie animation for the hero section. Shows the actual product in action. Phera uses animated mock UIs on their homepage — we should aim for something similar but real. |
