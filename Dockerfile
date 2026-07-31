FROM node:20-alpine AS builder
WORKDIR /app

# install dependencies (including dev deps needed to build Vite app)
COPY package*.json ./
RUN npm install

# copy source and build
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

# copy built static files
COPY --from=builder /app/dist ./dist

# use a small Node-based static server so we don't depend on nginx
RUN npm install -g serve@14.1.2

EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
