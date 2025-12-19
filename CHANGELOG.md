# Changelog - Solitario para Wely

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Versionado Semántico](https://semver.org/lang/es/).

## [2.0.0] - 2025-12-18

### 🎉 Versión Especial "Optimizado para Wely"

Esta versión está completamente optimizada para la abuelita Hury (Wely), con mejoras significativas en visibilidad, usabilidad móvil y mensajes personalizados.

### ✨ Agregado
- **Mensajes personalizados para Wely:** Más de 40 mensajes cariñosos usando los nombres "Wely" y "Hury"
  - Mensajes según hora del día (morning, afternoon, evening, night)
  - Mensajes de combo cuando hace 4+ movimientos seguidos a foundation
  - Mensajes de ánimo cada 90 segundos de inactividad (paciencia)
  - Mensajes especiales al mover a foundation (20% probabilidad)
- **Pantalla completa automática:** Se activa automáticamente al girar a modo horizontal
- **Sistema de versionado:** Versión visible en HeaderBar, sistema SemVer implementado

### 🔧 Mejorado
- **Visibilidad en vertical:** Cartas 29% más grandes en portrait (75x105px vs 58x81px)
  - Fuentes más grandes y bold (rank 18px, suit 20px, center 44px)
  - Bordes más gruesos (3px) para mejor contraste
  - Text-shadow en cartas rojas para mayor legibilidad
  - Color negro más oscuro para mejor contraste
- **Foundation cards:** Ahora se superponen en lugar de apilarse verticalmente
  - Evita crecimiento excesivo del juego
  - Solo muestra la última carta
  - Mejor aprovechamiento del espacio
- **Optimización Galaxy Fold 4:** Layout ultra-compacto para pantallas < 300px
  - Cards 32x45px perfectamente visibles
  - Foundation en grid 4x1 horizontal
  - Header compacto con iconos destacados
  - Gaps mínimos (2-3px) para máximo espacio
  - Todo optimizado para 280px de ancho

### 🐛 Corregido
- **Error 400 después de varios movimientos:** Eliminada actualización optimista que causaba desincronización
  - Frontend ahora espera respuesta del servidor antes de actualizar estado
  - Backend es la fuente única de verdad
  - Movimientos 100% consistentes sin errores

### 📱 Dispositivos Soportados
- ✅ Galaxy Fold 4 (280px cover screen)
- ✅ iPhone SE y superiores (375px+)
- ✅ Tablets (768px+)
- ✅ Desktop (1920px+)
- ✅ Portrait y Landscape optimizados

---

## [1.1.0] - 2025-12-16

### ✨ Agregado
- Sistema de sonidos procedurales con Web Audio API
- 6 tipos de sonidos: card-flip, card-move, card-place, shuffle, win, error
- Toggle de sonido en HeaderBar
- Auto-complete mejorado con feedback sonoro

### 🔧 Mejorado
- Responsive design refinado para móviles pequeños (250px+)
- Touch drag-and-drop optimizado para dispositivos móviles
- Animaciones más suaves en transiciones

---

## [1.0.0] - 2025-12-15

### 🎉 Lanzamiento Inicial

Primera versión del Solitario Klondike como PWA para la abuelita.

### ✨ Características
- Juego completo de Solitario Klondike
- PWA instalable en dispositivos móviles
- Backend en Firebase Functions
- Base de datos Firestore para persistencia
- Responsive design desde 250px
- Drag-and-drop para escritorio
- Touch para móviles
- Validación de reglas del juego
- Sistema de puntaje
- Detección de victoria/derrota
- Mensajes motivacionales
- Custom domain: solitario-wely.web.app

### 🏗️ Arquitectura
- Frontend: Vue 3.3, TypeScript, Vite 5.0
- Backend: Node.js 20, Express, Firebase Functions v2
- Database: Firebase Firestore
- Hosting: Firebase Hosting
- Clean Architecture con SOLID principles

---

## Tipos de Cambios

- `✨ Agregado` para nuevas características
- `🔧 Mejorado` para cambios en funcionalidad existente
- `🐛 Corregido` para correcciones de bugs
- `📱 Dispositivos` para soporte de dispositivos
- `🏗️ Arquitectura` para cambios técnicos
- `📝 Documentación` para cambios en documentación
- `🔒 Seguridad` para arreglos de seguridad

---

## Enlaces

- [Repositorio GitHub](https://github.com/margandona/solitario)
- [URL del Juego](https://solitario-wely.web.app)
- [Firebase Console](https://console.firebase.google.com/project/culinary-1613e)
