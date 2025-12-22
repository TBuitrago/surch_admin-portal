#!/bin/bash

# Script de prueba local para verificar que todo funciona
# Uso: bash test-local.sh

set -e

echo "🧪 Prueba Local - Surch Admin Portal"
echo "======================================"
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no está instalado${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Node.js encontrado: $(node --version)"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "backend/package.json" ] || [ ! -f "frontend/package.json" ]; then
    echo -e "${RED}❌ Error: Debes ejecutar este script desde la raíz del proyecto${NC}"
    exit 1
fi

# Verificar archivo .env del backend
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠️  Advertencia: backend/.env no existe${NC}"
    echo "Crea el archivo backend/.env con:"
    echo "  SUPABASE_URL=tu_url"
    echo "  SUPABASE_SERVICE_ROLE_KEY=tu_key"
    echo "  PORT=3001"
    echo "  FRONTEND_URL=http://localhost:3001"
    echo ""
    read -p "¿Continuar de todos modos? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Verificar que el frontend esté compilado
if [ ! -f "frontend/dist/index.html" ]; then
    echo -e "${YELLOW}⚠️  Frontend no está compilado${NC}"
    echo "Compilando frontend..."
    cd frontend
    npm install
    npm run build
    cd ..
    echo -e "${GREEN}✓${NC} Frontend compilado"
else
    echo -e "${GREEN}✓${NC} Frontend ya está compilado"
fi

echo ""

# Instalar dependencias del backend si es necesario
if [ ! -d "backend/node_modules" ]; then
    echo "Instalando dependencias del backend..."
    cd backend
    npm install
    cd ..
    echo -e "${GREEN}✓${NC} Dependencias instaladas"
fi

echo ""
echo -e "${YELLOW}📝 Instrucciones:${NC}"
echo ""
echo "1. En esta terminal, inicia el servidor:"
echo "   cd backend"
echo "   npm start"
echo ""
echo "2. En otra terminal, ejecuta las pruebas:"
echo "   node test-local.js"
echo ""
echo "3. O prueba manualmente en tu navegador:"
echo "   http://localhost:3001/api/health"
echo "   http://localhost:3001/api/health?debug=true"
echo "   http://localhost:3001/"
echo ""
echo -e "${GREEN}✅ Preparación completada!${NC}"

