# 🚀 Guía de Despliegue

Esta guía explica cómo desplegar el juego de Solitario en producción.

## 📋 Opciones de Despliegue

### 1. Vercel (Recomendado para Frontend) + Railway (Backend)
### 2. Netlify (Frontend) + Heroku (Backend)
### 3. Docker + VPS
### 4. Servidor tradicional (Node.js)

---

## ✅ Preparación para Producción

### Backend

**1. Variables de entorno**
```bash
# .env en producción
PORT=3000
NODE_ENV=production
DECK_API_URL=https://deckofcardsapi.com/api/deck
CORS_ORIGIN=https://tu-dominio.com
```

**2. Compilar TypeScript**
```bash
cd backend
npm run build
```

**3. Verificar que funciona**
```bash
npm start
```

### Frontend

**1. Actualizar URL del backend**
```typescript
// src/infrastructure/api/GameApiClient.ts
const baseURL = import.meta.env.PROD 
  ? 'https://tu-api.com/api'
  : 'http://localhost:3000/api';
```

**2. Compilar**
```bash
cd frontend
npm run build
```

Los archivos estarán en `frontend/dist/`

---

## 🎯 Opción 1: Vercel + Railway

### Backend en Railway

**1. Crear cuenta en Railway.app**

**2. Nuevo proyecto desde GitHub**
- Conecta tu repositorio
- Railway detectará Node.js automáticamente

**3. Configurar variables de entorno**
```
NODE_ENV=production
CORS_ORIGIN=https://tu-app.vercel.app
```

**4. Configurar Start Command**
```
npm run build && npm start
```

**5. Obtener URL del backend**
Railway te dará una URL como: `https://tu-app.railway.app`

### Frontend en Vercel

**1. Crear cuenta en Vercel.com**

**2. Importar proyecto**
- New Project → Import Git Repository
- Selecciona tu repo

**3. Configurar build**
```
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Root Directory: frontend
```

**4. Variables de entorno**
```
VITE_API_URL=https://tu-api.railway.app
```

**5. Deploy**
Vercel construirá y desplegará automáticamente.

---

## 🐳 Opción 2: Docker

### Dockerfiles

**Backend Dockerfile**
```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

**Frontend Dockerfile**
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**Frontend nginx.conf**
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
```

**Ejecutar**
```bash
docker-compose up -d
```

---

## 🌐 Opción 3: VPS (DigitalOcean, AWS, etc.)

### Configuración del servidor

**1. Conectar al servidor**
```bash
ssh usuario@tu-servidor.com
```

**2. Instalar Node.js y PM2**
```bash
# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2
sudo npm install -g pm2
```

**3. Clonar repositorio**
```bash
git clone https://github.com/tu-usuario/solitario.git
cd solitario
```

**4. Configurar backend**
```bash
cd backend
npm install
npm run build

# Crear .env
echo "NODE_ENV=production" > .env
echo "PORT=3000" >> .env
echo "CORS_ORIGIN=https://tu-dominio.com" >> .env

# Iniciar con PM2
pm2 start dist/index.js --name solitario-api
pm2 save
pm2 startup
```

**5. Configurar frontend con Nginx**
```bash
cd ../frontend
npm install
npm run build

# Copiar archivos construidos
sudo cp -r dist/* /var/www/solitario/
```

**6. Configurar Nginx**
```nginx
# /etc/nginx/sites-available/solitario
server {
    listen 80;
    server_name tu-dominio.com;
    root /var/www/solitario;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/solitario /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**7. Configurar HTTPS con Let's Encrypt**
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com
```

---

## 📱 Configurar PWA para Producción

### 1. Verificar manifest.json

Asegúrate de que todas las rutas sean absolutas:
```json
{
  "start_url": "/",
  "scope": "/",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      ...
    }
  ]
}
```

### 2. Generar iconos reales

Usa una herramienta como https://realfavicongenerator.net/

### 3. Service Worker

Vite PWA Plugin lo genera automáticamente al hacer build.

### 4. Verificar PWA

1. Abre tu sitio en Chrome
2. DevTools → Lighthouse
3. Ejecuta auditoría PWA
4. Debe pasar todas las verificaciones

---

## 🔒 Seguridad

### Backend

**1. Helmet.js para headers de seguridad**
```bash
npm install helmet
```

```typescript
// En index.ts
import helmet from 'helmet';

app.use(helmet());
```

**2. Rate limiting**
```bash
npm install express-rate-limit
```

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // máximo 100 requests por IP
});

app.use('/api', limiter);
```

**3. CORS configurado correctamente**
```typescript
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
```

### Frontend

**1. Variables de entorno**
```typescript
// vite.config.ts
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
  }
});
```

**2. Content Security Policy**
Configurar en el servidor web (Nginx/Apache).

---

## 📊 Monitoreo

### Backend

**1. PM2 Monitoring**
```bash
pm2 monitor
```

**2. Logs**
```bash
pm2 logs solitario-api
```

**3. Health check endpoint**
Ya incluido en el código: `GET /health`

### Frontend

**1. Google Analytics (opcional)**
```typescript
// main.ts
import { analytics } from './analytics';

analytics.init('TU-ID-DE-GA');
```

**2. Error tracking con Sentry**
```bash
npm install @sentry/vue
```

---

## 🚀 CI/CD con GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install & Build Backend
        working-directory: ./backend
        run: |
          npm ci
          npm run build
          npm test
      
      - name: Deploy to Railway
        # Usar Railway CLI o API
        run: railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install & Build Frontend
        working-directory: ./frontend
        run: |
          npm ci
          npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./frontend
```

---

## ✅ Checklist Pre-Despliegue

### Backend
- [ ] Variables de entorno configuradas
- [ ] Build exitoso (`npm run build`)
- [ ] Tests pasando (`npm test`)
- [ ] CORS configurado correctamente
- [ ] Rate limiting implementado
- [ ] Logs configurados
- [ ] Health check funcionando

### Frontend
- [ ] Build exitoso (`npm run build`)
- [ ] URL del API correcta
- [ ] Iconos PWA generados
- [ ] Manifest.json configurado
- [ ] Service Worker funcionando
- [ ] Responsive en móviles
- [ ] Lighthouse PWA score > 90

### General
- [ ] Dominio configurado
- [ ] HTTPS/SSL configurado
- [ ] Backups configurados (si usa DB)
- [ ] Monitoreo activo
- [ ] Documentación actualizada

---

## 🆘 Solución de Problemas

### PWA no se instala

1. Verificar que esté en HTTPS
2. Verificar manifest.json válido
3. Verificar service worker registrado
4. Revisar consola del navegador

### API no responde

1. Verificar que el backend esté corriendo
2. Revisar logs del servidor
3. Verificar CORS
4. Verificar firewall/puertos

### Build falla

1. Limpiar node_modules: `rm -rf node_modules && npm install`
2. Verificar versión de Node.js
3. Revisar errores de TypeScript
4. Verificar variables de entorno

---

## 📚 Recursos Adicionales

- **PWA**: https://web.dev/progressive-web-apps/
- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app/
- **Docker Docs**: https://docs.docker.com/
- **Nginx Docs**: https://nginx.org/en/docs/
- **Let's Encrypt**: https://letsencrypt.org/

---

**¡Listo para producción!** 🎉

Tu abuelita podrá jugar desde cualquier dispositivo, incluso sin conexión.
