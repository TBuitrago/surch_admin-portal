# Guía de Prueba Local

Esta guía te ayudará a verificar que tu aplicación funciona correctamente antes de subirla a Hostinger.

## Prerrequisitos

- Node.js 18+ instalado
- npm instalado
- Variables de entorno configuradas

## Paso 1: Configurar Variables de Entorno

Crea un archivo `.env` en la carpeta `backend/`:

```bash
cd backend
```

Crea el archivo `.env` con:

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
PORT=3001
FRONTEND_URL=http://localhost:3001
```

## Paso 2: Instalar Dependencias del Backend

```bash
cd backend
npm install
```

## Paso 3: Compilar el Frontend (si no está compilado)

```bash
cd ../frontend
npm install
npm run build
```

Esto generará los archivos en `frontend/dist/`.

## Paso 4: Iniciar el Servidor

En una terminal, desde la carpeta `backend/`:

```bash
cd backend
npm start
```

O para desarrollo con auto-reload:

```bash
npm run dev
```

Deberías ver:
```
Server running on port 3001
Health check: http://localhost:3001/api/health
=== Frontend Configuration ===
...
```

## Paso 5: Probar los Endpoints

### 5.1 Health Check Básico

Abre en tu navegador:
```
http://localhost:3001/api/health
```

Deberías ver:
```json
{"status":"ok"}
```

### 5.2 Health Check con Debug

Abre en tu navegador:
```
http://localhost:3001/api/health?debug=true
```

Esto mostrará información sobre:
- El directorio actual
- Las rutas que está probando para el frontend
- Si encontró el frontend o no

### 5.3 Probar el Frontend

Abre en tu navegador:
```
http://localhost:3001/
```

Deberías ver la aplicación React funcionando.

### 5.4 Probar Rutas del Frontend

Prueba estas rutas (todas deberían servir el frontend):
```
http://localhost:3001/login
http://localhost:3001/clients
```

## Paso 6: Ejecutar Pruebas Automáticas (Opcional)

Si quieres ejecutar las pruebas automáticas:

```bash
# En una terminal, inicia el servidor
cd backend
npm start

# En otra terminal, ejecuta las pruebas
node test-local.js
```

## Verificación Final

✅ **El servidor inicia sin errores**
✅ **`/api/health` responde con `{"status":"ok"}`**
✅ **`/api/health?debug=true` muestra información del frontend**
✅ **`/` muestra el frontend (aplicación React)**
✅ **Las rutas del frontend funcionan (SPA routing)**

## Problemas Comunes

### Error: "Missing required environment variables"
- Verifica que el archivo `.env` exista en `backend/`
- Verifica que tenga `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`

### Error: "frontend/dist not found"
- Asegúrate de haber ejecutado `npm run build` en la carpeta `frontend/`
- Verifica que exista `frontend/dist/index.html`

### El frontend no carga
- Verifica los logs del servidor para ver qué ruta está buscando
- Usa `/api/health?debug=true` para ver qué rutas está probando

### Error de CORS
- Verifica que `FRONTEND_URL` en `.env` sea `http://localhost:3001`

## Siguiente Paso

Una vez que todo funcione localmente, puedes subir el código a Hostinger siguiendo las instrucciones en `HOSTINGER.md`.

