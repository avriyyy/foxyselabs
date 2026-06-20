FROM node:20-alpine AS deps
WORKDIR /app

# Build context is the repo root (see docker-compose.yml).
# Enable corepack for pnpm.
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate

# Copy only the files pnpm needs to resolve the workspace graph.
COPY pnpm-workspace.yaml package.json ./
COPY apps/web/package.json ./apps/web/

# Install only the web workspace and its deps.
RUN pnpm install --filter @foxyselabs/web... --frozen-lockfile=false

FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

RUN corepack enable && corepack prepare pnpm@9.12.0 --activate

# Reuse node_modules from the deps stage.
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules

# Copy the rest of the web app source.
COPY apps/web ./apps/web
COPY pnpm-workspace.yaml package.json ./

RUN pnpm --filter @foxyselabs/web build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
CMD ["node", "apps/web/server.js"]
