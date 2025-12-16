# Firebase Hosting - Guía de Despliegue

## 🚀 Desplegar en Firebase Hosting (solitario-wely)

### 1. Instalar Firebase CLI
```powershell
npm install -g firebase-tools
firebase login
```

### 2. Inicializar Firebase (solo primera vez)
```powershell
firebase init hosting
```
- Proyecto: Crear o seleccionar proyecto existente
- Public directory: `frontend/dist`
- Single-page app: Yes

### 3. Compilar y Desplegar
```powershell
# Compilar frontend
cd frontend
npm run build

# Volver a raíz y desplegar
cd ..
firebase deploy --only hosting:solitario-wely
```

### 4. URL Final
- https://solitario-wely.web.app
- https://solitario-wely.firebaseapp.com

## ⚠️ Importante: Backend

El backend debe desplegarse por separado. Opciones:
- **Render** (recomendado): https://render.com
- Railway: https://railway.app
- Google Cloud Run
- Heroku

Luego actualizar en `frontend/.env.production`:
```
VITE_API_URL=https://tu-backend-url.com
```

## 🔄 Actualizar Versión
1. Editar `frontend/src/version.ts`
2. Build: `cd frontend && npm run build`
3. Deploy: `firebase deploy --only hosting:solitario-wely`
