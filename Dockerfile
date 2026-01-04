# Stage 1: Build stage
FROM node:24-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files and prisma schema
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma

# Install all dependencies (including dev)
RUN pnpm install --frozen-lockfile

# Generate Prisma Client
RUN pnpm db:generate

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# Prune to production-only dependencies
RUN pnpm prune --prod

# Stage 2: Production image
FROM node:24-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma

# Install production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy built application
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

# Create cache file
RUN mkdir -p /app && touch /app/.cache.db && chown -R nestjs:nodejs /app

# Create logs directory
RUN mkdir -p /app/logs && chown -R nestjs:nodejs /app/logs

USER nestjs

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["node", "dist/src/main.js"]
