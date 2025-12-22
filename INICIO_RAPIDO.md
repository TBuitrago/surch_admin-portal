# Inicio Rápido - Ejecutar Localmente

## Pasos para ejecutar la aplicación localmente

### 1. Verificar/Crear archivo .env

Asegúrate de tener un archivo `backend/.env` con tus credenciales de Supabase:

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
PORT=3001
FRONTEND_URL=http://localhost:3001
```

### 2. Instalar dependencias (si no están instaladas)

**Backend:**
```powershell
cd backend
npm install
cd ..
```

**Frontend:**
```powershell
cd frontend
npm install
cd ..
```

### 3. Compilar el frontend (si no está compilado)

```powershell
cd frontend
npm run build
cd ..
```

### 4. Iniciar el servidor

```powershell
cd backend
npm start
```

### 5. Abrir en el navegador

- **API Health Check:** http://localhost:3001/api/health
- **API con Debug:** http://localhost:3001/api/health?debug=true
- **Aplicación Frontend:** http://localhost:3001/

## Script Automático (PowerShell)

También puedes usar el script `start-local.ps1`:

```powershell
.\start-local.ps1
```

Este script:
- Verifica/crea el archivo .env
- Instala dependencias si faltan
- Compila el frontend si es necesario
- Inicia el servidor

## Verificación

Una vez que el servidor esté corriendo, deberías ver:

```
Server running on port 3001
Health check: http://localhost:3001/api/health
=== Frontend Configuration ===
Frontend path found: T:\REPOS\surch_admin-portal\frontend\dist
Frontend build exists: true
```

## Detener el servidor

Presiona `Ctrl+C` en la terminal donde está corriendo el servidor.

