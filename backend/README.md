# Backend del Solitario

API Node.js + Express para el juego de Solitario Klondike.

## Estructura

```
src/
├── domain/          # Lógica de negocio pura
│   ├── entities/    # Card, Pile, GameState
│   ├── services/    # GameService
│   └── interfaces/  # DeckProvider, GameRepository
├── application/     # Casos de uso
│   └── usecases/    # StartNewGame, MoveCards, etc.
├── infrastructure/  # Implementaciones concretas
│   ├── api/         # DeckOfCardsApiService
│   ├── repositories/ # InMemoryGameRepository
│   └── http/        # Controllers y Routes
└── config/          # Configuración
```

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

## Construcción

```bash
npm run build
npm start
```

## Tests

```bash
npm test
npm run test:watch
npm run test:coverage
```

## API Endpoints

- `POST /api/game` - Iniciar nueva partida
- `GET /api/game/:id` - Obtener estado del juego
- `POST /api/game/:id/draw` - Robar cartas del mazo
- `POST /api/game/:id/move` - Mover cartas
- `POST /api/game/:id/foundation-auto` - Auto-completar
- `POST /api/game/:id/validate-move` - Validar movimiento
- `GET /health` - Health check

## Arquitectura

Este backend sigue **Clean Architecture** con capas claramente separadas:

1. **Dominio**: Entidades y reglas de negocio independientes
2. **Aplicación**: Casos de uso que orquestan la lógica
3. **Infraestructura**: Implementaciones concretas (API, HTTP, DB)

## Principios SOLID aplicados

- **S**: Cada clase tiene una responsabilidad única
- **O**: Abierto a extensión, cerrado a modificación
- **L**: Las abstracciones son intercambiables
- **I**: Interfaces pequeñas y específicas
- **D**: Dependemos de abstracciones, no de concreciones
