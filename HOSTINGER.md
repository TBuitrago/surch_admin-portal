# Instrucciones para Desplegar en Hostinger

## Configuración en Hostinger

### 1. Preparar el Proyecto

Asegúrate de que el frontend esté compilado antes de subir:

```bash
cd frontend
npm install
npm run build
```

Esto generará los archivos estáticos en `frontend/dist/` que el backend servirá.

### 2. Configurar Variables de Entorno en Hostinger

En el panel de Hostinger, configura las siguientes variables de entorno para el backend:

**Backend (.env o en el panel de Hostinger):**
```
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
PORT=3001
FRONTEND_URL=https://tu-dominio.com
```

**Nota:** Hostinger puede asignar un puerto diferente. Ajusta `PORT` según lo que Hostinger te indique.

### 3. Configuración de la App Node.js en Hostinger

1. **Startup File:** `backend/server.js`
2. **Node Version:** 18.x o superior
3. **Port:** El puerto que Hostinger asigne (generalmente se configura automáticamente)

### 4. Estructura de Archivos

Asegúrate de que la estructura del proyecto sea:

```
tu-proyecto/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── node_modules/ (se instala automáticamente)
├── frontend/
│   └── dist/ (debe estar compilado antes de subir)
└── .gitignore
```

### 5. Instalación de Dependencias

Hostinger instalará automáticamente las dependencias cuando detecte `package.json` en el directorio del backend. Asegúrate de que el `package.json` tenga el script `start`:

```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

### 6. Verificación

Una vez desplegado:

1. Verifica que el backend esté corriendo: `https://tu-dominio.com/api/health`
2. Verifica que el frontend se sirva correctamente: `https://tu-dominio.com`
3. Verifica que las rutas del frontend funcionen (SPA routing)

## Troubleshooting

### El backend no inicia
- Verifica las variables de entorno en el panel de Hostinger
- Revisa los logs en el panel de Hostinger
- Asegúrate de que `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` estén configurados

### El frontend no carga
- Verifica que `frontend/dist/` exista y contenga `index.html`
- Asegúrate de haber ejecutado `npm run build` en el frontend antes de subir

### Error de CORS
- Verifica que `FRONTEND_URL` en las variables de entorno coincida con tu dominio
- Asegúrate de que el dominio esté configurado correctamente en Hostinger

### Las rutas del frontend no funcionan
- El backend ya está configurado para servir el SPA correctamente
- Todas las rutas que no empiecen con `/api` servirán `index.html`

## Notas Importantes

- El backend sirve tanto la API (`/api/*`) como el frontend compilado
- No necesitas configurar Nginx o PM2 - Hostinger maneja esto
- El puerto se configura automáticamente por Hostinger
- Las variables de entorno se configuran en el panel de Hostinger, no en archivos `.env`

