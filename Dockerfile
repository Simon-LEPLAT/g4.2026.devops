# syntax=docker/dockerfile:1
# Image optimisée : multi-stage + alpine + user non-root + healthcheck.
# Les cache mounts BuildKit accélèrent les rebuilds (npm ci quasi instantané).

# --- Stage 1 : builder (lourd, jetable) ---
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# --- Stage 2 : runtime (léger, distribué) ---
FROM node:20-alpine AS runtime

# Utilisateur non-root (limite la surface d'attaque)
RUN addgroup -S app && adduser -S app -G app

WORKDIR /app

# Dépendances de production uniquement
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev

# Artefacts compilés depuis le builder
COPY --from=builder /app/dist ./dist

USER app

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -t1 --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/server.js"]
