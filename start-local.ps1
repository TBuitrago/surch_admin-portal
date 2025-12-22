# Script para iniciar la aplicación localmente en Windows
# Uso: .\start-local.ps1

Write-Host "🚀 Iniciando Surch Admin Portal Localmente" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js no está instalado. Por favor instálalo primero." -ForegroundColor Red
    exit 1
}

Write-Host "✓ Node.js encontrado: $(node --version)" -ForegroundColor Green
Write-Host ""

# Paso 1: Verificar/Crear archivo .env del backend
Write-Host "📝 Paso 1: Configurando variables de entorno..." -ForegroundColor Yellow
if (-not (Test-Path "backend\.env")) {
    Write-Host "⚠️  Archivo .env no existe en backend/" -ForegroundColor Yellow
    Write-Host "Creando archivo .env de ejemplo..." -ForegroundColor Yellow
    
    $envContent = @"
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
PORT=3001
FRONTEND_URL=http://localhost:3001
"@
    
    $envContent | Out-File -FilePath "backend\.env" -Encoding utf8
    Write-Host "✓ Archivo .env creado. POR FAVOR EDÍTALO con tus credenciales reales de Supabase." -ForegroundColor Green
    Write-Host ""
    Write-Host "Presiona cualquier tecla después de editar backend\.env..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
} else {
    Write-Host "✓ Archivo .env existe" -ForegroundColor Green
}
Write-Host ""

# Paso 2: Instalar dependencias del backend
Write-Host "📦 Paso 2: Instalando dependencias del backend..." -ForegroundColor Yellow
if (-not (Test-Path "backend\node_modules")) {
    Set-Location backend
    Write-Host "Ejecutando npm install..." -ForegroundColor Gray
    npm install
    Set-Location ..
    Write-Host "✓ Dependencias del backend instaladas" -ForegroundColor Green
} else {
    Write-Host "✓ Dependencias del backend ya instaladas" -ForegroundColor Green
}
Write-Host ""

# Paso 3: Instalar dependencias del frontend
Write-Host "📦 Paso 3: Instalando dependencias del frontend..." -ForegroundColor Yellow
if (-not (Test-Path "frontend\node_modules")) {
    Set-Location frontend
    Write-Host "Ejecutando npm install..." -ForegroundColor Gray
    npm install
    Set-Location ..
    Write-Host "✓ Dependencias del frontend instaladas" -ForegroundColor Green
} else {
    Write-Host "✓ Dependencias del frontend ya instaladas" -ForegroundColor Green
}
Write-Host ""

# Paso 4: Compilar el frontend
Write-Host "🔨 Paso 4: Compilando el frontend..." -ForegroundColor Yellow
if (-not (Test-Path "frontend\dist\index.html")) {
    Set-Location frontend
    Write-Host "Ejecutando npm run build..." -ForegroundColor Gray
    npm run build
    Set-Location ..
    Write-Host "✓ Frontend compilado" -ForegroundColor Green
} else {
    Write-Host "✓ Frontend ya está compilado" -ForegroundColor Green
}
Write-Host ""

# Paso 5: Iniciar el servidor
Write-Host "🚀 Paso 5: Iniciando el servidor..." -ForegroundColor Yellow
Write-Host ""
Write-Host "El servidor se iniciará en: http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "Presiona Ctrl+C para detener el servidor" -ForegroundColor Gray
Write-Host ""

Set-Location backend
npm start

