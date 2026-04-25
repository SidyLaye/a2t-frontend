# Frontend (Vite + React + TS) — multi-stage build.
# Production image serves the static SPA bundle via nginx.

# ─── 1. Build ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
# VITE_* env vars are baked at build time. Provide them via --build-arg.
ARG VITE_API_URL=http://mourad-backend-jynoeg-0c01a9-51-178-81-232.traefik.me
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# ─── 2. Serve ──────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html

# SPA fallback so deep links (e.g. /clients/<uuid>) resolve to index.html.
RUN printf '%s\n' \
  'server {' \
  '  listen 80;' \
  '  root /usr/share/nginx/html;' \
  '  index index.html;' \
  '  location / { try_files $uri /index.html; }' \
  '}' \
  > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
