# ═══════════════════════════════════════════════════════════════
# PrepMind Backend – Production Dockerfile
# Optimized for AWS ECS / App Runner / EC2 (200+ concurrent users)
# ═══════════════════════════════════════════════════════════════

# Stage 1: Build & Dependencies
FROM node:20-alpine AS dependencies

WORKDIR /usr/src/app

# Install build essentials if native modules need compilation
RUN apk add --no-cache python3 make g++

COPY package*.json ./

# Install only production dependencies cleanly
RUN npm ci --omit=dev

# ── Stage 2: Production Image ────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=3000

# Install curl for container health checking
RUN apk add --no-cache curl

# Copy dependencies and application code
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY . .

# Run as non-root user for security (CIS Docker benchmark)
USER node

EXPOSE 3000

# Container Healthcheck (polls the /health route every 30s)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "server.js"]

