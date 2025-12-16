# 🚀 Guía de Inicio Rápido

¡Bienvenido! Esta guía te ayudará a poner en marcha el juego de Solitario para tu abuelita.

## 📋 Prerrequisitos

Asegúrate de tener instalado:
- **Node.js 18+** (recomendado: versión LTS)
- **npm** o **pnpm** (viene con Node.js)

Verifica tu instalación:
```bash
node --version
npm --version
```

## 🎯 Instalación Rápida

### 1. Backend (API)

```bash
# Navegar a la carpeta del backend
cd backend

# Instalar dependencias
npm install

# Crear archivo .env (opcional, usa valores por defecto)
copy .env.example .env

# Iniciar en modo desarrollo
npm run dev
```

El backend estará corriendo en: **http://localhost:3000**

### 2. Frontend (PWA)

Abre una **nueva terminal** (deja el backend corriendo):

```bash
# Navegar a la carpeta del frontend
cd frontend

# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev
```

El frontend estará corriendo en: **http://localhost:5173**

## ✅ Verificación

1. Abre tu navegador en `http://localhost:5173`
2. Deberías ver la pantalla de bienvenida del juego
3. Haz clic en "Comenzar Juego"
4. ¡Disfruta jugando!

## 🎮 Cómo Jugar

### Controles Básicos
- **Click en el mazo (Stock)**: Roba una carta
- **Arrastra cartas**: Mueve cartas entre pilas
- **Botón Auto**: Completa automáticamente movimientos válidos
- **Nuevo Juego**: Reinicia la partida

### Reglas
- **Tableau (Mesa)**: Apila cartas en orden descendente alternando colores
- **Foundations (Bases)**: Completa cada palo del As al Rey
- **Espacios vacíos**: Solo pueden llenarse con Reyes
- **Objetivo**: Mover todas las cartas a las foundations

## 🛠️ Comandos Útiles

### Backend
```bash
npm run dev        # Modo desarrollo (recarga automática)
npm run build      # Compilar TypeScript
npm start          # Ejecutar versión compilada
npm test           # Ejecutar tests
npm run test:watch # Tests en modo watch
```

### Frontend
```bash
npm run dev        # Modo desarrollo
npm run build      # Construir para producción
npm run preview    # Vista previa de producción
npm run type-check # Verificar tipos TypeScript
```

## 📱 Instalar como PWA

### En móvil (Android/iOS):
1. Abre el juego en el navegador
2. Busca la opción "Agregar a pantalla de inicio"
3. Acepta y el juego se instalará como una app

### En escritorio (Chrome/Edge):
1. Abre el juego
2. Busca el ícono de instalación en la barra de direcciones
3. Haz clic en "Instalar"

## 🔧 Solución de Problemas

### El backend no inicia
- Verifica que el puerto 3000 esté libre
- Revisa que Node.js esté instalado correctamente
- Elimina `node_modules` y ejecuta `npm install` de nuevo

### El frontend no conecta con el backend
- Asegúrate de que el backend esté corriendo
- Verifica que ambos usen los puertos correctos (3000 y 5173)
- Revisa la configuración del proxy en `vite.config.ts`

### Error al instalar dependencias
- Actualiza npm: `npm install -g npm@latest`
- Limpia caché: `npm cache clean --force`
- Intenta con node_modules limpio

## 📚 Próximos Pasos

Una vez que todo funcione:

1. **Personalizar iconos PWA**: Reemplaza los placeholders en `/frontend/public/icons/`
2. **Ajustar mensajes**: Edita `/frontend/src/utils/niceMessages.ts`
3. **Cambiar estilos**: Modifica los archivos `.vue` en `/frontend/src/presentation/components/`
4. **Agregar features**: Sigue la estructura de Clean Architecture

## 💡 Tips de Desarrollo

- El backend usa **hot-reload** con `ts-node-dev`
- El frontend usa **HMR** (Hot Module Replacement) de Vite
- Los cambios se reflejan automáticamente sin reiniciar
- Usa las DevTools del navegador para debuggear el frontend
- Revisa los logs de la terminal para errores del backend

## 🎨 Personalización Rápida

### Cambiar colores
Edita las variables CSS en `/frontend/src/style.css`:
```css
:root {
  --primary-color: #2E7D32;  /* Verde principal */
  --background: #e8f5e9;      /* Fondo */
}
```

### Agregar más mensajes
Edita `/frontend/src/utils/niceMessages.ts` y añade frases a los arrays.

### Cambiar reglas del juego
Edita `/backend/src/domain/services/GameService.ts` (capa de dominio).

## 🤝 ¿Necesitas Ayuda?

- Revisa el `README.md` principal para documentación completa
- Consulta los comentarios en el código (están en español)
- Revisa la estructura de carpetas en el README

## 🎉 ¡Listo!

Tu juego de Solitario está funcionando. Ahora puedes disfrutarlo con tu abuelita ❤️

---

**Hecho con amor para la abuelita** 👵💖
