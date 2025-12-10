FROM node:20-bullseye-slim AS builder

WORKDIR /usr/src/app

# Install system deps required by some native modules (sharp, etc.)
RUN apt-get update && \
    apt-get install -y --no-install-recommends build-essential python3 make g++ libvips-dev && \
    rm -rf /var/lib/apt/lists/*

# Copy lockfile and package manifests first for better caching
COPY package*.json ./
COPY package-lock.json ./

# Install all deps (including dev) for building
RUN npm ci

# Copy source and build
COPY . .
 # Generate Prisma client for the container runtime before building
 RUN npx prisma generate
 
 RUN npm run build

# Remove dev dependencies to slim down the image
RUN npm prune --production

FROM node:20-bullseye-slim AS runner
WORKDIR /usr/src/app

# Only install runtime deps — copy from builder
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY package*.json ./

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/src/main"]
