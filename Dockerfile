FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run db:migrate -- --dry-run && npm exec vite build -- --config client/vite.config.js
EXPOSE 8080
CMD ["node", "server/src/index.js"]
