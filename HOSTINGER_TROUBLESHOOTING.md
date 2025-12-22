# Solución de Problemas - Hostinger 503 Error

## El servidor muestra error 503

Esto significa que el servidor Node.js no está iniciando correctamente. Sigue estos pasos:

### 1. Verificar Variables de Entorno

En el panel de Hostinger, asegúrate de que estas variables estén configuradas:

```
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
PORT=3001
```

**Importante:** Si falta alguna de estas variables, el servidor NO iniciará.

### 2. Verificar la Estructura de Archivos

Basándome en las imágenes que compartiste, la estructura debería ser:

```
public_html/
├── .builds/
│   └── source/
│       └── repository/
│           ├── backend/
│           │   ├── server.js
│           │   └── package.json
│           └── frontend/
│               └── dist/
│                   ├── index.html
│                   └── assets/
└── DO_NOT_UPLOAD_HERE
```

### 3. Verificar el Startup File en Hostinger

En el panel de Hostinger, configura:
- **Startup File:** `backend/server.js` o `.builds/source/repository/backend/server.js`
- **Node Version:** 18.x o superior

### 4. Verificar los Logs

En el panel de Hostinger:
1. Ve a tu aplicación Node.js
2. Busca "Logs" o "Application Logs"
3. Revisa si hay errores al iniciar

Los errores comunes son:
- `Missing required environment variables` - Faltan variables de entorno
- `Cannot find module` - Faltan dependencias (ejecuta `npm install`)
- `EADDRINUSE` - El puerto ya está en uso

### 5. Configurar la Ruta del Frontend

Si el frontend está en `/public_html/.builds/source/repository/frontend/dist`, agrega esta variable de entorno:

**Nombre:** `FRONTEND_DIST_PATH`  
**Valor:** `/public_html/.builds/source/repository/frontend/dist`

### 6. Verificar que el Frontend esté Compilado

Asegúrate de que el directorio `frontend/dist` exista y contenga:
- `index.html`
- `assets/` (con los archivos CSS y JS)

### 7. Probar el Servidor Localmente Primero

Antes de subir a Hostinger, prueba localmente:

```bash
cd backend
npm install
node server.js
```

Si funciona localmente pero no en Hostinger, el problema es de configuración en Hostinger.

### 8. Contactar Soporte de Hostinger

Si nada funciona, contacta al soporte de Hostinger y comparte:
- Los logs de la aplicación
- La estructura de archivos
- Las variables de entorno configuradas (sin valores sensibles)

