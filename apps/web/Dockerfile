# Build-Phase
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Serve-Phase
FROM node:18-alpine

WORKDIR /app

COPY --from=build /app/dist /app

RUN npm install -g serve

EXPOSE 3050

CMD ["serve", "-s", "/app", "-l", "3050"]