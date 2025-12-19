# 📱 Sistema de Actualización y Versionado PWA

## ¿Cómo Funciona?

### 1. **Versionado Semántico (SemVer)**

Usamos formato `MAJOR.MINOR.PATCH`:
- **MAJOR** (1.x.x): Cambios que rompen compatibilidad
- **MINOR** (x.1.x): Nuevas funcionalidades
- **PATCH** (x.x.1): Arreglos de bugs

**Versión actual:** v1.0.0

### 2. **Frontend (PWA)**

#### Service Worker
- Vite PWA genera automáticamente el Service Worker
- Pre-cachea todos los assets (JS, CSS, HTML, imágenes)
- Cuando cambias código, los assets tienen nuevos hashes
- El SW detecta cambios y descarga nueva versión

#### Estrategia: `prompt`
```typescript
// vite.config.ts
VitePWA({
  registerType: 'prompt'  // Pide permiso antes de actualizar
})
```

**Flujo:**
1. Usuario abre la app → SW verifica si hay updates
2. Si hay nueva versión → Muestra popup "¡Nueva versión disponible!"
3. Usuario hace clic en "Actualizar" → Recarga con nueva versión
4. Si cierra el popup → Sigue con versión vieja hasta próximo refresh

#### Verificación Automática
El SW verifica actualizaciones:
- Al abrir la app
- Cada 1 hora (configurable en UpdatePrompt.vue)
- Cuando la tab vuelve visible

### 3. **Backend (Firebase Functions)**

#### Despliegue Directo
```bash
firebase deploy --only functions
```

Las Functions se actualizan instantáneamente:
- No hay cache
- Cambios son inmediatos
- Los usuarios ven nueva versión al siguiente request

#### Versión en `/health`
```json
GET https://us-central1-culinary-1613e.cloudfunctions.net/api/health
{
  "status": "OK",
  "version": "1.0.0",
  "timestamp": "2025-12-18T..."
}
```

---

## 🔄 Cómo Actualizar la Aplicación

### Paso 1: Cambiar el Código

Haz tus cambios en:
- `frontend/src/` (Vue components, utils, etc.)
- `functions/src/` (Backend logic)

### Paso 2: Incrementar Versión

**Frontend:**
```bash
cd frontend

# Para bugs pequeños (1.0.0 → 1.0.1)
npm run version:patch

# Para nuevas features (1.0.0 → 1.1.0)
npm run version:minor

# Para cambios grandes (1.0.0 → 2.0.0)
npm run version:major
```

Esto actualiza automáticamente:
- `package.json` → `"version": "1.0.1"`
- `version.ts` → `export const VERSION = "1.0.1"`

**Backend:**
Actualiza manualmente `functions/src/version.ts`:
```typescript
export const VERSION = '1.0.1';
```

### Paso 3: Actualizar CHANGELOG.md

```markdown
## [1.0.1] - 2025-12-18

### Fixed
- Corregido bug de validación en foundation cards
- Mejorada visualización en Galaxy Fold 4

### Changed
- Mensajes más personalizados para Wely
```

### Paso 4: Compilar

**Frontend:**
```bash
cd frontend
npm run build
```

**Backend:**
```bash
cd functions
npm run build
```

### Paso 5: Desplegar

**Todo junto:**
```bash
firebase deploy
```

**Solo hosting (más rápido):**
```bash
firebase deploy --only hosting:solitario-wely
```

**Solo functions:**
```bash
firebase deploy --only functions
```

### Paso 6: Commit y Push

```bash
git add .
git commit -m "Release v1.0.1 - Fix foundation validation"
git tag v1.0.1
git push origin main --tags
```

---

## 📦 Cache y Actualización

### ¿Por qué el usuario no ve cambios inmediatamente?

#### Service Worker Cache
El SW cachea assets para funcionar offline:
```
Cache Storage (Browser):
├── precache-v1-https://solitario-wely.web.app/
│   ├── index-ABC123.js
│   ├── index-XYZ789.css
│   └── manifest.json
```

Cuando despliegas nueva versión:
1. Assets tienen nuevos hashes: `index-DEF456.js`
2. SW descarga nuevos assets en background
3. **Popup aparece:** "¡Nueva versión disponible!"
4. Usuario hace clic → `updateServiceWorker()` → Recarga

### Cache Bust Manual

Si el usuario no ve el popup, puede forzar refresh:
- **Desktop:** Ctrl + Shift + R (o Cmd + Shift + R en Mac)
- **Mobile:** 
  1. Abrir configuración del navegador
  2. Limpiar cache del sitio
  3. O desinstalar/reinstalar PWA

---

## 🧪 Testing de Updates

### En Desarrollo

1. Cambia algo visible (ej: color, texto)
2. Incrementa versión: `npm run version:patch`
3. Build: `npm run build`
4. Deploy: `firebase deploy --only hosting`
5. Abre la app en incógnito
6. Deberías ver cambios inmediatamente

### En Producción

1. Usuario abre app → SW verifica updates
2. Si hay nueva versión:
   - Descarga assets en background
   - Muestra popup después de 2-3 segundos
3. Usuario hace clic "Actualizar"
4. App recarga con nueva versión
5. Muestra nuevo número de versión en header

---

## 🔧 Configuración Actual

### vite.config.ts
```typescript
VitePWA({
  registerType: 'prompt',        // Pide confirmación
  includeAssets: [...],          // Assets a pre-cachear
  manifest: {
    name: 'Solitario para la Abuelita',
    version: '1.0.0'             // Versión en manifest
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
    runtimeCaching: [...]        // Cache de API externa
  }
})
```

### UpdatePrompt.vue
```typescript
useRegisterSW({
  onNeedRefresh() {
    // Muestra popup cuando hay update
    needRefresh.value = true;
  },
  onRegistered(registration) {
    // Verifica updates cada 1 hora
    setInterval(() => {
      registration.update();
    }, 60 * 60 * 1000);
  }
})
```

---

## 📊 Verificar Versión

### Frontend (Usuario)
1. Abrir app
2. Ver esquina del header → `v1.0.0`

### Backend (API)
```bash
curl https://us-central1-culinary-1613e.cloudfunctions.net/api/health
```
Response:
```json
{
  "status": "OK",
  "version": "1.0.0"
}
```

### Service Worker (DevTools)
1. F12 → Application tab
2. Service Workers
3. Ver "Status" y "Source"

---

## 🐛 Troubleshooting

### "Usuario no ve cambios"

**Solución 1:** Esperar el popup
- El SW verifica updates automáticamente
- Puede tardar hasta 1 hora

**Solución 2:** Forzar update
```javascript
// En DevTools Console
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.update());
});
```

**Solución 3:** Limpiar cache
```javascript
// En DevTools Console
caches.keys().then(names => {
  names.forEach(name => caches.delete(name));
});
location.reload();
```

### "Service Worker no se registra"

**Verificar:**
1. HTTPS activo (PWA requiere HTTPS)
2. Firebase Hosting activo
3. No hay errores en Console (F12)

**Forzar re-registro:**
```javascript
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister());
});
location.reload();
```

### "Versión no coincide"

**Sincronizar:**
```bash
# Verificar versiones
cat frontend/package.json | grep version
cat frontend/src/version.ts
cat functions/src/version.ts

# Actualizar todas
cd frontend && npm run version:patch
# Copiar versión a functions/src/version.ts
```

---

## 🎯 Best Practices

### 1. Siempre incrementar versión
Cada deploy debe tener nueva versión:
```bash
npm run version:patch  # Siempre antes de deploy
```

### 2. Mantener CHANGELOG.md
Documenta cada cambio:
```markdown
## [1.0.1] - 2025-12-18
### Fixed
- Bug X corregido
```

### 3. Testing antes de deploy
```bash
npm run build && npm run preview  # Test local
```

### 4. Deploy progresivo
1. Deploy a staging primero (si existe)
2. Test en móvil real
3. Deploy a producción

### 5. Comunicación
- Mencionar cambios importantes en el popup
- Usar mensajes amigables para Wely
- No forzar updates (dejar que ella decida)

---

## 📱 Para la Abuelita Wely

Cuando veas el mensaje **"¡Nueva versión disponible, Wely!"**:

1. 🎉 Significa que hay mejoras y arreglos
2. ✨ Haz clic en "Actualizar Ahora" para obtenerlos
3. 🔄 La app se recargará rápidamente
4. ✅ Verás el nuevo número de versión en la esquina

**No te preocupes:**
- Tus partidas guardadas NO se pierden
- El juego se actualiza en segundos
- Puedes seguir jugando sin problemas

---

## 🚀 Roadmap de Versionado

### v1.0.0 (Actual)
- ✅ Juego completo funcional
- ✅ PWA instalable
- ✅ Responsive para Galaxy Fold 4
- ✅ Mensajes personalizados para Wely

### v1.1.0 (Próximo)
- ⏳ Pantalla completa automática en landscape
- ⏳ Más mensajes según hora del día
- ⏳ Estadísticas de juego

### v2.0.0 (Futuro)
- 💡 Temas personalizables
- 💡 Multijugador
- 💡 Torneos semanales
