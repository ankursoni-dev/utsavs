# syntax=docker/dockerfile:1.7

# ── Stage 1: Prune monorepo for api only
FROM node:22-alpine AS pruner
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.33.3 --activate
RUN pnpm add -g turbo@^2
WORKDIR /app
COPY . .
RUN turbo prune api --docker

# ── Stage 2: Install deps (cached when package.json unchanged)
FROM node:22-alpine AS installer
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.33.3 --activate
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile

# ── Stage 3: Build
FROM installer AS builder
COPY --from=pruner /app/out/full/ .
RUN pnpm turbo build --filter=api

# ── Stage 4: Production runner
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/node_modules ./node_modules
COPY --from=builder /app/apps/api/package.json .
EXPOSE 3001
CMD ["node", "dist/main.js"]

# ── Dev target (used by compose.yaml). Runs nest start --watch with hot reload.
FROM installer AS dev
RUN pnpm add -g @nestjs/cli
WORKDIR /app
COPY --from=pruner /app/out/full/ .
EXPOSE 3001
CMD ["pnpm", "--filter", "api", "dev"]
