# syntax=docker/dockerfile:1.7

# ── Stage 1: Prune monorepo for web only
FROM node:22-alpine AS pruner
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.33.3 --activate
RUN pnpm add -g turbo@^2
WORKDIR /app
COPY . .
RUN turbo prune web --docker

# ── Stage 2: Install deps
FROM node:22-alpine AS installer
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.33.3 --activate
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile

# ── Stage 3: Build (Next.js standalone output)
FROM installer AS builder
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=pruner /app/out/full/ .
RUN pnpm turbo build --filter=web

# ── Stage 4: Production runner (slim, only standalone output)
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Next.js standalone output bundles only what's needed at runtime.
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

EXPOSE 3000
CMD ["node", "apps/web/server.js"]

# ── Dev target (used by compose.yaml). Hot reload via volume mounts.
FROM installer AS dev
WORKDIR /app
COPY --from=pruner /app/out/full/ .
ENV NEXT_TELEMETRY_DISABLED=1
EXPOSE 3000
CMD ["pnpm", "--filter", "web", "dev"]
