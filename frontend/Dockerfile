# Stage 1: Build React static assets
FROM node:20-slim AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Set default API base URL for container runtime requests redirection
ENV VITE_API_BASE_URL=/api
RUN npm run build

# Stage 2: Serve compiled static assets via Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
