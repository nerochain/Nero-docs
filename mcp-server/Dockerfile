FROM node:20-alpine AS builder
WORKDIR /app
ENV npm_config_update_notifier=false
COPY package.json tsconfig.json ./
RUN npm install --no-audit --no-fund
COPY src ./src
COPY data ./data
RUN npx tsc -p tsconfig.json

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV MCP_TRANSPORT=http
ENV PORT=8080
ENV npm_config_update_notifier=false
COPY package.json ./package.json
RUN npm install --omit=dev --no-audit --no-fund
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/data ./data
RUN addgroup -S app && adduser -S app -G app && chown -R app:app /app
USER app
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/health || exit 1
CMD ["node", "dist/index.js"]
