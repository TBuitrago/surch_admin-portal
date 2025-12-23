# Base Node image (alpine to keep it small)
FROM node:20-alpine

# Set working directory at repo root (keeps original structure)
WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci --omit=dev

# Copy backend source
COPY backend/ /app/backend/

# Copy pre-built frontend (must run `npm run build` in frontend before building image)
COPY frontend/dist /app/frontend/dist

# Environment
ENV NODE_ENV=production \
    PORT=3000

# Expose backend port
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
