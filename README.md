# 🃏 Solitario Klondike PWA

Una Progressive Web App (PWA) del clásico juego de Solitario Klondike, desarrollada con Vue 3 y desplegada en Firebase.

![Version](https://img.shields.io/badge/version-1.1.0-blue)
![Firebase](https://img.shields.io/badge/Firebase-Deployed-orange)
![Vue.js](https://img.shields.io/badge/Vue.js-3.3-green)

## 🎮 Demo en Vivo

**🌐 Aplicación:** https://solitario-wely.web.app

**🔗 API:** https://us-central1-culinary-1613e.cloudfunctions.net/api

### 📲 Instalar como App (PWA)

1. Visita **https://solitario-wely.web.app** en tu navegador
2. En el navegador verás un botón de "Instalar" o un ícono de instalación en la barra de direcciones
3. Haz clic en **"Instalar"** o **"Agregar a pantalla de inicio"**
4. ¡Listo! La app estará disponible como aplicación nativa en tu dispositivo

**En móviles:**
- **Android Chrome**: Menú → "Agregar a pantalla de inicio"
- **iOS Safari**: Botón compartir → "Agregar a pantalla de inicio"

**En escritorio:**
- **Chrome/Edge**: Ícono de instalación en la barra de direcciones (derecha)
- **Opera**: Botón "Instalar Solitario Klondike" en la barra de direcciones

## 🎯 Características

- 🎴 **Juego completo de Solitario Klondike** con todas las reglas clásicas
- 📱 **Responsive Design** - Desde 250px de ancho hasta 4K
- 🎴 **Cartas estilo Poker** - Con esquinas visibles para mejor jugabilidad
- 🔊 **Sistema de Sonidos** - 6 tipos de sonidos procedurales con Web Audio API
- ✋ **Validación de Movimientos** - Previene jugadas inválidas con retroalimentación
- 💾 **Persistencia en Firebase Firestore**
- ⚡ **Actualización Optimista** - Respuesta instantánea en la UI
- 🤖 **Auto-Completar** - Botón para terminar el juego automáticamente
- 🔄 **PWA** - Instálala como app nativa, funciona offline
- 🏗️ **Clean Architecture** con principios SOLID

## 📋 Plan de Desarrollo por Fases

### Fase 1 – Dominio y reglas del juego ✅
**Objetivo**: Crear la lógica central del juego independiente de frameworks

- ✅ Definir entidades: `Card`, `Pile`, `GameState`
- ✅ Implementar reglas de Solitario Klondike
- ✅ Validación de movimientos
- ✅ Detección de victoria/derrota
- ✅ Tests unitarios de dominio

**Archivos clave**:
- `backend/src/domain/entities/`
- `backend/src/domain/services/`

### Fase 2 – Backend (API) ✅
**Objetivo**: Exponer la lógica del juego vía HTTP

- ✅ Configurar Node.js + Express + TypeScript
- ✅ Implementar casos de uso (use cases)
- ✅ Integrar API externa de cartas (Deck of Cards API)
- ✅ Crear controladores HTTP RESTful
- ✅ Tests de casos de uso

**Endpoints**:
- `POST /api/game` - Iniciar nueva partida
- `GET /api/game/:id` - Obtener estado del juego
- `POST /api/game/:id/draw` - Robar carta del mazo
- `POST /api/game/:id/move` - Mover carta(s)
- `POST /api/game/:id/foundation-auto` - Auto-completar foundations

### Fase 3 – Frontend (Vue 3) ✅
**Objetivo**: Crear interfaz visual intuitiva

- ✅ Configurar Vue 3 + Vite + TypeScript
- ✅ Crear componentes del tablero:
  - `GameBoard.vue` - Tablero principal
  - `Pile.vue` - Pila de cartas
  - `Card.vue` - Carta individual
  - `HeaderBar.vue` - Cabecera con controles
  - `NiceMessageModal.vue` - Mensajes para la abuelita
- ✅ Conectar con backend API
- ✅ Implementar drag & drop
- ✅ Añadir mensajes cariñosos

### Fase 4 – PWA y mejoras 🚧
**Objetivo**: Hacer la app instalable y mejorar UX

- ✅ Configurar manifest.json
- ✅ Implementar service worker
- ✅ Iconos para diferentes tamaños
- ⏳ Caché para juego sin conexión
- ⏳ Animaciones suaves
- ⏳ Feedback visual en movimientos

### Fase 5 – Refactor y documentación 📝
**Objetivo**: Pulir y documentar

- ⏳ Revisión de Clean Architecture
- ⏳ Refactor de código repetido
- ⏳ Documentación de API
- ⏳ Guía de despliegue

## 🏗️ Arquitectura del Proyecto

```
solitario/
├── backend/                  # API Node.js + Express
│   ├── src/
│   │   ├── domain/          # Entidades y reglas de negocio (independiente)
│   │   │   ├── entities/    # Card, Pile, GameState
│   │   │   ├── services/    # Lógica de dominio pura
│   │   │   └── interfaces/  # Abstracciones (DeckProvider, GameRepository)
│   │   ├── application/     # Casos de uso
│   │   │   └── usecases/    # startNewGame, moveCard, drawFromStock
│   │   ├── infrastructure/  # Implementaciones concretas
│   │   │   ├── api/         # API externa de cartas
│   │   │   ├── http/        # Controladores Express
│   │   │   └── repositories/ # Almacenamiento en memoria
│   │   └── config/          # Configuración
│   └── tests/               # Tests unitarios
├── frontend/                # PWA Vue 3
│   ├── public/              # Recursos estáticos
│   │   ├── icons/           # Iconos PWA
│   │   └── manifest.json    # Manifest PWA
│   ├── src/
│   │   ├── domain/          # Modelos/tipos compartidos
│   │   ├── application/     # Stores y lógica de aplicación
│   │   ├── infrastructure/  # Cliente API
│   │   ├── presentation/    # Componentes Vue
│   │   │   └── components/
│   │   ├── pwa/             # Service worker
│   │   └── utils/           # Mensajes lindos para la abuelita
│   └── vite.config.ts       # Configuración Vite + PWA
└── README.md                # Este archivo
```

## 🚀 Instalación y Ejecución

### Prerrequisitos
- Node.js 18+ 
- npm o pnpm

### Instalación

```bash
# Clonar el repositorio
cd solitario

# Instalar dependencias del backend
cd backend
npm install

# Instalar dependencias del frontend
cd ../frontend
npm install
```

### Modo Desarrollo

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Servidor corriendo en http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# App corriendo en http://localhost:5173
```

### Construcción para Producción

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
# Los archivos estarán en frontend/dist/
```

## 🎮 Cómo Jugar

### Reglas del Solitario Klondike

1. **Objetivo**: Mover todas las cartas a las 4 bases (foundations) en orden ascendente por palo (A→K)

2. **Tableau (Mesa)**:
   - 7 columnas
   - Se apilan cartas en orden descendente alternando colores (rojo/negro)
   - Se pueden mover secuencias de cartas
   - Espacios vacíos solo aceptan Reyes

3. **Stock (Mazo)**: Click para robar cartas

4. **Waste (Descarte)**: Cartas robadas del mazo

5. **Foundations (Bases)**: Completar del As al Rey por cada palo

## 🔧 Principios de Diseño

### Clean Architecture

- **Dominio**: Lógica de negocio pura, sin dependencias externas
- **Aplicación**: Orquestación de casos de uso
- **Infraestructura**: Implementaciones concretas (APIs, HTTP, DB)
- **Presentación**: UI y componentes visuales

### SOLID

- **S** (Single Responsibility): Cada clase/módulo con una única responsabilidad
- **O** (Open/Closed): Abierto a extensión, cerrado a modificación
- **L** (Liskov Substitution): Las abstracciones son intercambiables
- **I** (Interface Segregation): Interfaces pequeñas y específicas
- **D** (Dependency Inversion): Dependemos de abstracciones, no de concreciones

## 🧪 Tests

```bash
# Backend
cd backend
npm test
npm run test:watch

# Frontend
cd frontend
npm test
```

## 📦 Tecnologías Utilizadas

### Backend
- Node.js + Express
- TypeScript
- Deck of Cards API (para barajar cartas)

### Frontend
- Vue 3 (Composition API)
- Vite
- TypeScript
- Vite PWA Plugin
- CSS moderno

## 💝 Mensajes para la Abuelita

El juego incluye mensajes cariñosos que aparecen en momentos especiales:

- 🎮 **Al iniciar**: Mensajes de bienvenida
- 🏆 **Al ganar**: Felicitaciones amorosas
- 💫 **Al perder**: Palabras de ánimo

## 🔮 Próximas Mejoras

- [ ] Persistencia de partidas en base de datos
- [ ] Sistema de puntajes y estadísticas
- [ ] Modo de dificultad (sorteo 1 o 3 cartas)
- [ ] Función "Deshacer" (undo)
- [ ] Hints automáticos para ayudar
- [ ] Temas visuales personalizables
- [ ] Sonidos opcionales

## 👵 Hecho con amor para la abuelita ❤️

Este proyecto fue creado pensando en la comodidad y disfrute de mi abuelita. Cada detalle está diseñado para que sea fácil de usar y ver.

## 📄 Licencia

MIT - Úsalo libremente y compártelo con amor.
