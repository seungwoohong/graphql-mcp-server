FROM node:20-slim AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml* ./

RUN pnpm i --frozen-lockfile
COPY . .
RUN pnpm run build

FROM node:20-slim AS runner
RUN useradd -m -u 10001 nodeusr
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./
ENV PORT=8080
USER nodeusr
CMD ["node", "dist/server.js"]
EXPOSE 8080