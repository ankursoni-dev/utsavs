# Project Context — Index

> This file is the index that orients agents to the codebase. It is automatically injected into every code-related prompt by the `ENRICH-PROMPT.py` hook, so keep it concise — under ~100 lines.
>
> The **CONTEXT-CURATOR** subagent maintains this file and the per-module wikis under `modules/`. Other agents read it but do not write it.

## Project at a glance

- **Type**: Monorepo (pnpm workspace + Turborepo)
- **Stack**: NestJS v11 (apps/api/) + Next.js v16.2 (apps/web/)
- **ORM**: Prisma 7 with PostgreSQL 16
- **Auth**: Phone OTP + JWT (planned; see ADR-001)
- **Infrastructure**: Docker Compose (postgres, redis, api, web services)
- **CI/CD**: TypeScript strict mode, Prettier, ESLint, Swagger docs at `/api/docs`

## Conventions in this codebase

- Response envelope follows `.claude/skills/nestjs/SKILL.md` (universal section).
- Validation: global `ValidationPipe` with `whitelist`, `forbidNonWhitelisted`, `transform`.
- Error envelope: `{ statusCode, error (machine code), message, timestamp, path }`.
- Versioning: URI (`/v1/...`).
- All atomic writes: single transaction. External side effects: outbox pattern.

## Modules

> The curator adds an entry here for each module under `modules/`.
> Format: `- [name](modules/<name>.md) — one-line purpose`

- [data-model](modules/data-model.md) — Prisma 7 schema: 16 models, 14 enums, money-in-paise convention, PrismaService global injection
- [web-shell](modules/web-shell.md) — Next.js 16 shell: Docker dev, design tokens, ThemeProvider, UI primitives, route groups

## Architectural decisions

> ADRs live in `decisions/`. The curator adds an entry here per ADR.
> Format: `- [NNNN: Title](decisions/NNNN-slug.md) — one-line outcome`

_(no ADRs yet)_

## Key cross-cutting concerns

> Fill in as cross-cutting infrastructure is implemented:
> - **Response envelope** — which interceptor, where it lives
> - **Error envelope** — which filter, the standard shape
> - **Validation** — global pipe config, 422 detail format
