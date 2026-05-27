FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json prisma.config.ts ./
COPY prisma/ prisma/
RUN npm install

COPY . .
RUN NODE_ENV=production npm run build
RUN npx prisma generate

FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache openssl

COPY --from=builder /app/node_modules node_modules/
COPY --from=builder /app/dist dist/
COPY --from=builder /app/server server/
COPY --from=builder /app/prisma prisma/
COPY package.json .env.example ./

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

CMD ["node", "server/index.js"]
