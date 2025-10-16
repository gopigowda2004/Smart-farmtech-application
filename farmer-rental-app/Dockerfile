# syntax=docker/dockerfile:1

# Build React app
FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci --no-audit --no-fund

COPY . .
# Build with optional API base URL; can be overridden via build-arg
ARG REACT_APP_API_BASE_URL
ENV REACT_APP_API_BASE_URL=${REACT_APP_API_BASE_URL}
RUN npm run build

# Nginx to serve build and proxy /api to backend
FROM nginx:1.27-alpine
WORKDIR /usr/share/nginx/html

# Remove default content and add our build
RUN rm -rf ./*
COPY --from=build /app/build .

# Add Nginx config for SPA and API proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx","-g","daemon off;"]