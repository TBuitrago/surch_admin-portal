#!/bin/bash

# Script de deployment para Hostinger
# Uso: bash deploy.sh

set -e

echo "🚀 Iniciando deployment de Surch Admin Portal..."

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instálalo primero."
    exit 1
fi

echo -e "${GREEN}✓${NC} Node.js encontrado: $(node --version)"

# Instalar dependencias del backend
echo -e "\n${YELLOW}📦 Instalando dependencias del backend...${NC}"
cd backend
npm install --production
cd ..

# Instalar dependencias del frontend
echo -e "\n${YELLOW}📦 Instalando dependencias del frontend...${NC}"
cd frontend
npm install

# Build del frontend
echo -e "\n${YELLOW}🔨 Construyendo frontend...${NC}"
npm run build
cd ..

echo -e "\n${GREEN}✅ Build completado!${NC}"
echo -e "\n${YELLOW}📝 Próximos pasos:${NC}"
echo "1. Verifica que los archivos .env estén configurados correctamente"
echo "2. Inicia el backend con: pm2 start backend/ecosystem.config.js"
echo "3. Configura Nginx para servir el frontend desde frontend/dist"
echo "4. Reinicia Nginx: sudo systemctl restart nginx"

