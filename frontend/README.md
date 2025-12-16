# Frontend del Solitario

PWA Vue 3 para el juego de Solitario Klondike.

## Estructura

```
src/
├── domain/          # Tipos TypeScript
├── application/     # Composables (useGameState)
├── infrastructure/  # Cliente API
│   └── api/         # GameApiClient
├── presentation/    # Componentes Vue
│   └── components/  # Card, Pile, GameBoard, etc.
└── utils/           # Mensajes lindos
```

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## Construcción

```bash
npm run build
npm run preview
```

## Características PWA

- Instalable en dispositivos móviles y desktop
- Funciona sin conexión (básico)
- Manifest configurado
- Service Worker automático (Vite PWA Plugin)

## Componentes Principales

- **App.vue**: Componente raíz
- **GameBoard.vue**: Tablero del juego
- **Card.vue**: Carta individual
- **Pile.vue**: Pila de cartas
- **HeaderBar.vue**: Cabecera con controles
- **NiceMessageModal.vue**: Mensajes para la abuelita

## Accesibilidad

- Texto grande y legible
- Alto contraste
- Botones grandes
- Diseño responsive
- Pensado para personas mayores
