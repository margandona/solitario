# 🏗️ Arquitectura del Proyecto Solitario

Este documento explica la arquitectura implementada en el proyecto.

## 📐 Clean Architecture

El proyecto sigue los principios de **Clean Architecture** de Robert C. Martin (Uncle Bob), organizando el código en capas concéntricas con dependencias que apuntan hacia adentro.

```
┌─────────────────────────────────────────┐
│        Infrastructure Layer             │  ← Frameworks, APIs externas, HTTP
│  (Express, Axios, API externa)          │
├─────────────────────────────────────────┤
│        Application Layer                │  ← Casos de uso, orquestación
│  (Use Cases, Composables)               │
├─────────────────────────────────────────┤
│        Domain Layer                     │  ← Lógica de negocio pura
│  (Entities, Services, Interfaces)       │
└─────────────────────────────────────────┘
```

### Capas del Backend

#### 1. Domain (Dominio)
**Ubicación**: `/backend/src/domain/`

**Responsabilidad**: Contiene la lógica de negocio pura, independiente de frameworks.

- **Entities** (`/entities/`):
  - `Card.ts`: Representa una carta con su rango, palo y estado
  - `Pile.ts`: Representa una pila de cartas (tableau, foundation, stock, waste)
  - `GameState.ts`: Estado completo de una partida

- **Services** (`/services/`):
  - `GameService.ts`: Lógica del juego (inicialización, movimientos, validaciones)

- **Interfaces** (`/interfaces/`):
  - `DeckProvider`: Abstracción para obtener mazos de cartas
  - `GameRepository`: Abstracción para persistir estados de juego

**Principios aplicados**:
- ✅ No depende de frameworks externos
- ✅ Funciones puras cuando es posible
- ✅ Reglas de negocio explícitas y testables

#### 2. Application (Aplicación)
**Ubicación**: `/backend/src/application/`

**Responsabilidad**: Orquesta la lógica de dominio a través de casos de uso.

- **Use Cases** (`/usecases/`):
  - `StartNewGameUseCase.ts`: Iniciar nueva partida
  - `DrawFromStockUseCase.ts`: Robar cartas del mazo
  - `MoveCardsUseCase.ts`: Mover cartas entre pilas
  - `AutoCompleteFoundationsUseCase.ts`: Auto-completar movimientos
  - `GetGameStateUseCase.ts`: Obtener estado del juego

**Principios aplicados**:
- ✅ Cada caso de uso tiene una responsabilidad única (SRP)
- ✅ Dependen de abstracciones, no de implementaciones (DIP)
- ✅ Fáciles de testear en aislamiento

#### 3. Infrastructure (Infraestructura)
**Ubicación**: `/backend/src/infrastructure/`

**Responsabilidad**: Implementaciones concretas de abstracciones del dominio.

- **API** (`/api/`):
  - `DeckOfCardsApiService.ts`: Implementación de `DeckProvider` usando API externa

- **Repositories** (`/repositories/`):
  - `InMemoryGameRepository.ts`: Implementación de `GameRepository` en memoria

- **HTTP** (`/http/`):
  - `GameController.ts`: Controlador Express para endpoints REST
  - `routes.ts`: Definición de rutas HTTP

**Principios aplicados**:
- ✅ Implementa interfaces definidas en el dominio
- ✅ Puede ser reemplazado sin afectar capas internas
- ✅ Maneja detalles técnicos (HTTP, APIs externas, DB)

### Capas del Frontend

#### 1. Domain (Dominio)
**Ubicación**: `/frontend/src/domain/`

**Responsabilidad**: Tipos TypeScript que representan el dominio.

- `types.ts`: Interfaces y tipos para Card, Pile, GameState, etc.

#### 2. Application (Aplicación)
**Ubicación**: `/frontend/src/application/`

**Responsabilidad**: Lógica de aplicación del frontend.

- `useGameState.ts`: Composable de Vue que maneja el estado reactivo del juego

**Principios aplicados**:
- ✅ Desacoplado de componentes Vue
- ✅ Puede ser testeado independientemente
- ✅ Maneja comunicación con la API

#### 3. Infrastructure (Infraestructura)
**Ubicación**: `/frontend/src/infrastructure/`

**Responsabilidad**: Comunicación con servicios externos.

- `api/GameApiClient.ts`: Cliente HTTP para comunicarse con el backend

#### 4. Presentation (Presentación)
**Ubicación**: `/frontend/src/presentation/`

**Responsabilidad**: Componentes Vue que renderizan la UI.

- `components/Card.vue`: Carta visual
- `components/Pile.vue`: Pila de cartas
- `components/GameBoard.vue`: Tablero completo
- `components/HeaderBar.vue`: Cabecera con controles
- `components/NiceMessageModal.vue`: Modal de mensajes

**Principios aplicados**:
- ✅ Componentes reutilizables
- ✅ Lógica mínima en componentes (delegada a composables)
- ✅ Props tipadas con TypeScript

## 🎯 Principios SOLID Aplicados

### S - Single Responsibility Principle
Cada clase/módulo tiene una única razón para cambiar:
- `Card`: Solo maneja lógica de una carta
- `GameService`: Solo maneja reglas del juego
- `StartNewGameUseCase`: Solo inicia nuevas partidas
- Cada componente Vue tiene una responsabilidad visual específica

### O - Open/Closed Principle
El código está abierto a extensión pero cerrado a modificación:
- Se pueden agregar nuevos casos de uso sin modificar existentes
- Se pueden implementar nuevos `DeckProvider` sin cambiar el dominio
- Se pueden agregar nuevas pilas o reglas extendiendo las existentes

### L - Liskov Substitution Principle
Las implementaciones pueden sustituirse por sus abstracciones:
- Cualquier `DeckProvider` puede usarse en lugar de otro
- Cualquier `GameRepository` puede intercambiarse
- Los componentes aceptan interfaces, no implementaciones concretas

### I - Interface Segregation Principle
Interfaces pequeñas y específicas:
- `DeckProvider` solo expone `getShuffledDeck()`
- `GameRepository` solo tiene métodos de persistencia necesarios
- No hay interfaces "gordas" con métodos no utilizados

### D - Dependency Inversion Principle
Las capas dependen de abstracciones, no de concreciones:
- Los casos de uso reciben interfaces, no clases concretas
- `GameService` no conoce Express, HTTP o APIs externas
- El dominio es completamente independiente de frameworks

## 🔄 Flujo de una Acción

Ejemplo: **Mover una carta**

```
1. Usuario arrastra carta en UI (Pile.vue)
   ↓
2. Evento emitido a GameBoard.vue
   ↓
3. GameBoard llama a composable useGameState
   ↓
4. useGameState.moveCards() llama a GameApiClient
   ↓
5. GameApiClient hace POST /api/game/:id/move
   ↓
6. Express router recibe la petición
   ↓
7. GameController.moveCards() ejecuta
   ↓
8. Controller llama a MoveCardsUseCase.execute()
   ↓
9. UseCase obtiene GameState del Repository
   ↓
10. UseCase llama a GameService.moveCards()
   ↓
11. GameService valida y ejecuta reglas del dominio
   ↓
12. GameState se actualiza
   ↓
13. UseCase guarda GameState en Repository
   ↓
14. Controller responde con GameState actualizado
   ↓
15. useGameState actualiza estado reactivo
   ↓
16. Vue re-renderiza componentes automáticamente
```

## 📁 Estructura de Directorios Completa

```
solitario/
├── backend/
│   ├── src/
│   │   ├── domain/               # ❤️ Corazón del negocio
│   │   │   ├── entities/
│   │   │   ├── services/
│   │   │   └── interfaces/
│   │   ├── application/          # 🎯 Casos de uso
│   │   │   └── usecases/
│   │   ├── infrastructure/       # 🔧 Detalles técnicos
│   │   │   ├── api/
│   │   │   ├── repositories/
│   │   │   └── http/
│   │   ├── config/               # ⚙️ Configuración
│   │   └── index.ts              # 🚀 Punto de entrada
│   ├── tests/                    # ✅ Tests
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── domain/               # 📋 Tipos
│   │   ├── application/          # 🔄 Lógica de app
│   │   ├── infrastructure/       # 🌐 API client
│   │   ├── presentation/         # 🎨 Componentes Vue
│   │   │   └── components/
│   │   ├── utils/                # 🛠️ Utilidades
│   │   ├── App.vue               # 📱 App principal
│   │   ├── main.ts               # 🚀 Entry point
│   │   └── style.css
│   ├── public/                   # 📦 Assets estáticos
│   │   ├── icons/                # 🖼️ Iconos PWA
│   │   └── manifest.json
│   ├── vite.config.ts
│   └── package.json
│
├── README.md                     # 📖 Documentación principal
├── QUICK_START.md                # 🚀 Guía rápida
└── ARCHITECTURE.md               # 🏗️ Este archivo
```

## 🧪 Testing

### Backend
Los tests se enfocan en la lógica de dominio:

```bash
npm test
```

- **Tests de entidades**: Verifican comportamiento de Card, Pile, GameState
- **Tests de servicios**: Validan reglas del juego
- **Tests de casos de uso**: Comprueban orquestación correcta

### Estrategia de Testing
1. **Dominio**: 100% de cobertura (es crítico)
2. **Casos de uso**: Tests de integración con mocks
3. **Infraestructura**: Tests de integración opcionales

## 🔐 Ventajas de esta Arquitectura

### ✅ Mantenibilidad
- Código organizado y fácil de entender
- Cambios aislados en capas específicas
- Fácil de onboarding para nuevos desarrolladores

### ✅ Testabilidad
- Dominio 100% testeable sin frameworks
- Casos de uso testeables con mocks simples
- Tests rápidos de ejecución

### ✅ Escalabilidad
- Fácil agregar nuevos casos de uso
- Fácil cambiar implementaciones (ej: DB real)
- Fácil agregar nuevas features

### ✅ Flexibilidad
- Se puede cambiar Express por Fastify
- Se puede cambiar Vue por React
- Se puede cambiar la API externa de cartas
- **Sin tocar el dominio**

## 🎓 Conceptos Avanzados

### Dependency Injection Manual
```typescript
// En index.ts del backend
const deckProvider = new DeckOfCardsApiService();
const repository = new InMemoryGameRepository();
const useCase = new StartNewGameUseCase(deckProvider, repository);
const controller = new GameController(useCase, ...);
```

Esto permite:
- Inyectar mocks en tests
- Cambiar implementaciones fácilmente
- Mantener bajo acoplamiento

### Inversión de Dependencias
```typescript
// Dominio define la interfaz
interface DeckProvider {
  getShuffledDeck(): Promise<Card[]>;
}

// Infraestructura la implementa
class DeckOfCardsApiService implements DeckProvider {
  async getShuffledDeck(): Promise<Card[]> { ... }
}
```

El dominio no conoce a la infraestructura, solo a la abstracción.

## 📚 Recursos Adicionales

- **Clean Architecture**: "Clean Architecture" de Robert C. Martin
- **SOLID**: "Agile Software Development" de Robert C. Martin
- **Domain-Driven Design**: "Domain-Driven Design" de Eric Evans
- **Vue 3**: https://vuejs.org/
- **TypeScript**: https://www.typescriptlang.org/

---

**¿Preguntas?** Revisa los comentarios en el código. Están en español y explican cada decisión de diseño.
