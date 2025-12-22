#!/bin/bash

# Script rápido de deployment para Hostinger
# Uso: bash quick-deploy.sh

set -e

echo "🚀 Surch Admin Portal - Quick Deploy"
echo "======================================"
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no está instalado${NC}"
    echo "Instala Node.js 18+ primero:"
    echo "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
    echo "sudo apt install -y nodejs"
    exit 1
fi

echo -e "${GREEN}✓${NC} Node.js: $(node --version)"
echo -e "${GREEN}✓${NC} npm: $(npm --version)"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "backend/package.json" ] || [ ! -f "frontend/package.json" ]; then
    echo -e "${RED}❌ Error: Debes ejecutar este script desde la raíz del proyecto${NC}"
    exit 1
fi

# Verificar archivos .env
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠️  Advertencia: backend/.env no existe${NC}"
    echo "Crea el archivo backend/.env con tus credenciales de Supabase"
    exit 1
fi

if [ ! -f "frontend/.env" ]; then
    echo -e "${YELLOW}⚠️  Advertencia: frontend/.env no existe${NC}"
    echo "Crea el archivo frontend/.env con tus credenciales de Supabase"
    exit 1
fi

echo -e "${GREEN}✓${NC} Archivos .env encontrados"
echo ""

# Instalar dependencias del backend
echo -e "${YELLOW}📦 Instalando dependencias del backend...${NC}"
cd backend
npm install --production
cd ..

# Instalar dependencias del frontend
echo -e "${YELLOW}📦 Instalando dependencias del frontend...${NC}"
cd frontend
npm install

# Build del frontend
echo -e "${YELLOW}🔨 Construyendo frontend...${NC}"
npm run build
cd ..

echo ""
echo -e "${GREEN}✅ Build completado exitosamente!${NC}"
echo ""
echo -e "${YELLOW}📝 Próximos pasos manuales:${NC}"
echo ""
echo "1. Inicia el backend con PM2:"
echo "   cd backend"
echo "   pm2 start ecosystem.config.js"
echo "   pm2 save"
echo ""
echo "2. Configura Nginx (ver HOSTINGER_DEPLOY.md)"
echo ""
echo "3. Reinicia Nginx:"
echo "   sudo systemctl restart nginx"
echo ""
echo "4. Verifica el estado:"
echo "   pm2 status"
echo "   sudo systemctl status nginx"
echo ""

