FROM node:24-alpine AS base

# ----------------------------------------
# 1. Install all dependencies
# ----------------------------------------
FROM base AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile
RUN pnpm db:generate

# ----------------------------------------
# 2. Build the application
# ----------------------------------------
FROM base AS builder

WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# ----------------------------------------
# 3. Install only production dependencies
# ----------------------------------------
FROM base AS prod-deps

WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile --prod

# ----------------------------------------
# 4. Final Stage
# ----------------------------------------
FROM base AS runner

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=prod-deps /app/node_modules ./node_modules
RUN mkdir -p /app/logs && chown -R nestjs:nodejs /app/logs

USER nestjs
EXPOSE 8000

CMD ["node", "dist/src/main.js"]
