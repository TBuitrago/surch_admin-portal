# --- STAGE 1: Build Frontend ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
# Aquí es donde Vite lee el .env que creamos en la carpeta frontend
RUN npm run build

# --- STAGE 2: Backend & Final Image ---
FROM node:20-alpine
WORKDIR /app

# Dependencias Backend
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci --omit=dev

# Código Backend
COPY backend/ ./ 

# Traemos el build del frontend desde la etapa 1
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

ENV NODE_ENV=production PORT=3000
EXPOSE 3000
CMD ["npm", "start"]
