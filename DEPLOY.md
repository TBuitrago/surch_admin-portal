# Guía de Deployment en Hostinger

Esta guía te ayudará a desplegar la aplicación Surch Admin Portal en Hostinger.

## Requisitos Previos

1. **Cuenta Hostinger con VPS o plan que soporte Node.js**
   - Recomendado: VPS (mínimo 1GB RAM)
   - O plan de hosting compartido con soporte Node.js

2. **Acceso SSH** a tu servidor Hostinger

3. **Dominio configurado** (opcional pero recomendado)

---

## Opción 1: VPS Hostinger (Recomendado)

### Paso 1: Conectarse al Servidor

```bash
ssh root@tu-servidor-ip
# o
ssh usuario@tu-servidor-ip
```

### Paso 2: Instalar Node.js y npm

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalación
node --version
npm --version
```

### Paso 3: Instalar PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

### Paso 4: Instalar Nginx (Reverse Proxy)

```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Paso 5: Clonar el Repositorio

```bash
# Ir al directorio donde quieres la app (ej: /var/www)
cd /var/www

# Clonar tu repositorio
git clone https://github.com/tu-usuario/surch_admin-portal.git
cd surch_admin-portal
```

### Paso 6: Configurar Variables de Entorno

```bash
# Backend
cd backend
cp .env.example .env
nano .env
```

Edita el archivo `.env` con tus credenciales de Supabase:
```
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
PORT=3001
FRONTEND_URL=https://tu-dominio.com
```

```bash
# Frontend
cd ../frontend
cp .env.example .env
nano .env
```

Edita el archivo `.env` con:
```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key
VITE_API_URL=https://tu-dominio.com
```

### Paso 7: Instalar Dependencias y Build

```bash
# Backend
cd /var/www/surch_admin-portal/backend
npm install --production

# Frontend
cd /var/www/surch_admin-portal/frontend
npm install
npm run build
```

### Paso 8: Configurar PM2 para el Backend

```bash
cd /var/www/surch_admin-portal/backend

# Crear archivo de configuración PM2
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'surch-admin-backend',
    script: 'server.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
}
EOF

# Crear directorio de logs
mkdir -p logs

# Iniciar con PM2
pm2 start ecosystem.config.js

# Guardar configuración PM2
pm2 save

# Configurar PM2 para iniciar al arrancar el servidor
pm2 startup
# Ejecuta el comando que te muestre
```

### Paso 9: Configurar Nginx

```bash
sudo nano /etc/nginx/sites-available/surch-admin
```

Agrega esta configuración:

```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;

    # Frontend (archivos estáticos)
    location / {
        root /var/www/surch_admin-portal/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Habilitar el sitio
sudo ln -s /etc/nginx/sites-available/surch-admin /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### Paso 10: Configurar SSL (HTTPS) con Let's Encrypt

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtener certificado SSL
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com

# El certificado se renovará automáticamente
```

---

## Opción 2: Hosting Compartido con Node.js

Si Hostinger te ofrece Node.js en hosting compartido:

### Paso 1: Subir Archivos

1. Conecta por FTP/SFTP a tu hosting
2. Sube todos los archivos del proyecto a `public_html` o la carpeta que te indiquen

### Paso 2: Configurar Variables de Entorno

Crea los archivos `.env` en `backend/` y `frontend/` con tus credenciales.

### Paso 3: Build del Frontend

En el panel de Hostinger, abre el terminal y ejecuta:

```bash
cd frontend
npm install
npm run build
```

### Paso 4: Iniciar Backend

En el panel de Hostinger, configura la aplicación Node.js:
- **Startup File**: `backend/server.js`
- **Node Version**: 18.x
- **Port**: El que te asigne Hostinger

---

## Comandos Útiles

### Ver logs del backend
```bash
pm2 logs surch-admin-backend
```

### Reiniciar backend
```bash
pm2 restart surch-admin-backend
```

### Ver estado de PM2
```bash
pm2 status
```

### Actualizar la aplicación
```bash
cd /var/www/surch_admin-portal
git pull origin main
cd backend
npm install --production
pm2 restart surch-admin-backend
cd ../frontend
npm install
npm run build
sudo systemctl reload nginx
```

---

## Troubleshooting

### El backend no inicia
- Verifica las variables de entorno: `cat backend/.env`
- Revisa los logs: `pm2 logs surch-admin-backend`
- Verifica que el puerto 3001 esté disponible

### El frontend no carga
- Verifica que el build se haya completado: `ls -la frontend/dist`
- Revisa la configuración de Nginx: `sudo nginx -t`
- Verifica los permisos: `sudo chown -R www-data:www-data /var/www/surch_admin-portal/frontend/dist`

### Error de CORS
- Verifica que `FRONTEND_URL` en `backend/.env` coincida con tu dominio
- Verifica que `VITE_API_URL` en `frontend/.env` apunte a tu dominio

---

## Seguridad

1. **Firewall**: Configura UFW para permitir solo puertos necesarios
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

2. **Actualizar sistema regularmente**
```bash
sudo apt update && sudo apt upgrade -y
```

3. **No exponer el puerto 3001 directamente** - siempre usar Nginx como proxy

---

## Notas Importantes

- El frontend se sirve como archivos estáticos desde `frontend/dist`
- El backend corre en el puerto 3001 (interno, no expuesto)
- Nginx actúa como reverse proxy y sirve ambos
- PM2 mantiene el backend corriendo en segundo plano
- Las variables de entorno deben estar configuradas correctamente

