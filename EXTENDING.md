# 🚀 Guía de Extensión del Proyecto

Esta guía muestra cómo agregar nuevas funcionalidades al juego siguiendo Clean Architecture.

## 📋 Tabla de Contenidos

1. [Agregar un nuevo caso de uso](#agregar-un-nuevo-caso-de-uso)
2. [Agregar persistencia en base de datos](#agregar-persistencia-en-base-de-datos)
3. [Agregar función "Deshacer" (Undo)](#agregar-función-deshacer)
4. [Agregar sistema de hints](#agregar-sistema-de-hints)
5. [Agregar dificultad (robar 1 o 3 cartas)](#agregar-dificultad)
6. [Agregar sonidos](#agregar-sonidos)
7. [Agregar estadísticas y récords](#agregar-estadísticas)

---

## 1. Agregar un nuevo caso de uso

### Ejemplo: "Pista" (Hint) que sugiere un movimiento

#### Backend

**1. Crear el caso de uso**
```typescript
// backend/src/application/usecases/GetHintUseCase.ts
export interface HintResult {
  fromPileId: string;
  toPileId: string;
  cardCount: number;
  reason: string;
}

export class GetHintUseCase {
  constructor(private readonly gameRepository: GameRepository) {}

  async execute(gameId: string): Promise<HintResult | null> {
    const gameStateData = await this.gameRepository.findById(gameId);
    if (!gameStateData) {
      throw new Error('Juego no encontrado');
    }

    const gameState = GameState.fromJSON(gameStateData);
    
    // Lógica para encontrar un movimiento válido
    const hint = this.findBestMove(gameState);
    
    return hint;
  }

  private findBestMove(gameState: GameState): HintResult | null {
    // TODO: Implementar algoritmo de búsqueda de mejor movimiento
    // Prioridad:
    // 1. Mover a foundation
    // 2. Voltear carta boca abajo
    // 3. Mover a tableau vacío
    return null;
  }
}
```

**2. Agregar al controlador**
```typescript
// En GameController.ts
async getHint(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const hint = await this.getHintUseCase.execute(id);
    
    res.status(200).json({
      success: true,
      data: hint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener pista'
    });
  }
}
```

**3. Agregar ruta**
```typescript
// En routes.ts
router.get('/game/:id/hint', (req, res) => gameController.getHint(req, res));
```

#### Frontend

**1. Agregar método al API Client**
```typescript
// En GameApiClient.ts
async getHint(gameId: string): Promise<HintResult | null> {
  const response = await this.client.get(`/game/${gameId}/hint`);
  return response.data.data;
}
```

**2. Agregar al composable**
```typescript
// En useGameState.ts
async function getHint(): Promise<HintResult | null> {
  if (!gameState.value) return null;
  return await apiClient.getHint(gameState.value.id);
}

return {
  // ... otros métodos
  getHint
};
```

**3. Agregar botón en UI**
```vue
<!-- En HeaderBar.vue -->
<button class="btn btn-hint" @click="$emit('hint')">
  💡 Pista
</button>
```

---

## 2. Agregar persistencia en base de datos

### Ejemplo: MongoDB con Mongoose

**1. Instalar dependencia**
```bash
cd backend
npm install mongoose
npm install -D @types/mongoose
```

**2. Crear modelo**
```typescript
// backend/src/infrastructure/repositories/MongoGameRepository.ts
import mongoose from 'mongoose';
import { GameRepository } from '../../domain/interfaces';

const GameStateSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  tableauPiles: Array,
  foundationPiles: Array,
  stock: Object,
  waste: Object,
  status: String,
  moves: Array,
  score: Number,
  startTime: Date,
  endTime: Date
});

const GameStateModel = mongoose.model('GameState', GameStateSchema);

export class MongoGameRepository implements GameRepository {
  async save(gameState: any): Promise<void> {
    await GameStateModel.findOneAndUpdate(
      { id: gameState.id },
      gameState,
      { upsert: true, new: true }
    );
  }

  async findById(gameId: string): Promise<any | null> {
    const doc = await GameStateModel.findOne({ id: gameId });
    return doc ? doc.toObject() : null;
  }

  async delete(gameId: string): Promise<void> {
    await GameStateModel.deleteOne({ id: gameId });
  }

  async findAll(): Promise<any[]> {
    const docs = await GameStateModel.find();
    return docs.map(doc => doc.toObject());
  }
}
```

**3. Configurar conexión**
```typescript
// En config/index.ts
export const config = {
  // ... otros configs
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/solitario'
};
```

**4. Conectar en index.ts**
```typescript
// En index.ts
import mongoose from 'mongoose';
import { MongoGameRepository } from './infrastructure/repositories/MongoGameRepository';

async function connectDatabase() {
  await mongoose.connect(config.mongoUri);
  console.log('✅ Conectado a MongoDB');
}

// En setupDependencies()
const gameRepository = new MongoGameRepository(); // En lugar de InMemoryGameRepository
```

---

## 3. Agregar función "Deshacer"

### Backend

**1. Modificar GameState para guardar historial completo**
```typescript
// En GameState.ts
export interface HistoryEntry {
  timestamp: Date;
  action: string;
  snapshot: any; // Estado completo antes de la acción
}

export class GameState {
  constructor(
    // ... propiedades existentes
    public history: HistoryEntry[] = []
  ) {}

  saveToHistory(action: string): void {
    this.history.push({
      timestamp: new Date(),
      action,
      snapshot: this.toJSON()
    });
  }
}
```

**2. Crear caso de uso**
```typescript
// backend/src/application/usecases/UndoMoveUseCase.ts
export class UndoMoveUseCase {
  constructor(private readonly gameRepository: GameRepository) {}

  async execute(gameId: string): Promise<GameState> {
    const gameStateData = await this.gameRepository.findById(gameId);
    if (!gameStateData) {
      throw new Error('Juego no encontrado');
    }

    const gameState = GameState.fromJSON(gameStateData);
    
    if (gameState.history.length === 0) {
      throw new Error('No hay movimientos para deshacer');
    }

    // Restaurar el último estado guardado
    const lastEntry = gameState.history.pop()!;
    const restoredState = GameState.fromJSON(lastEntry.snapshot);
    
    await this.gameRepository.save(restoredState);
    return restoredState;
  }
}
```

**3. Modificar moveCards para guardar historial**
```typescript
// En GameService.ts
static moveCards(gameState: GameState, ...): void {
  // Guardar estado antes del movimiento
  gameState.saveToHistory('move');
  
  // ... resto de la lógica de movimiento
}
```

---

## 4. Agregar sistema de hints

### Backend - Algoritmo de búsqueda

```typescript
// backend/src/domain/services/HintService.ts
export class HintService {
  static findBestMove(gameState: GameState): HintResult | null {
    // Prioridad 1: Mover a foundation
    const foundationMove = this.findMoveToFoundation(gameState);
    if (foundationMove) return foundationMove;

    // Prioridad 2: Voltear carta boca abajo
    const flipMove = this.findFlipMove(gameState);
    if (flipMove) return flipMove;

    // Prioridad 3: Mover dentro del tableau
    const tableauMove = this.findTableauMove(gameState);
    if (tableauMove) return tableauMove;

    return null;
  }

  private static findMoveToFoundation(gameState: GameState): HintResult | null {
    // Revisar waste
    if (!gameState.waste.isEmpty()) {
      const card = gameState.waste.topCard!;
      for (const foundation of gameState.foundationPiles) {
        if (foundation.canAcceptCard(card)) {
          return {
            fromPileId: 'waste',
            toPileId: foundation.id,
            cardCount: 1,
            reason: 'Mover a fundación'
          };
        }
      }
    }

    // Revisar tableau
    for (const tableau of gameState.tableauPiles) {
      if (tableau.isEmpty()) continue;
      const card = tableau.topCard!;
      
      for (const foundation of gameState.foundationPiles) {
        if (foundation.canAcceptCard(card)) {
          return {
            fromPileId: tableau.id,
            toPileId: foundation.id,
            cardCount: 1,
            reason: 'Mover a fundación'
          };
        }
      }
    }

    return null;
  }

  // ... implementar otros métodos
}
```

---

## 5. Agregar dificultad

### Backend

**1. Modificar GameState**
```typescript
// En GameState.ts
export type Difficulty = 'easy' | 'normal' | 'hard';

export class GameState {
  constructor(
    // ... propiedades existentes
    public difficulty: Difficulty = 'normal'
  ) {}
}
```

**2. Modificar StartNewGameUseCase**
```typescript
// En StartNewGameUseCase.ts
async execute(difficulty: Difficulty = 'normal'): Promise<GameState> {
  const gameId = uuidv4();
  const shuffledDeck = await this.deckProvider.getShuffledDeck();
  const gameState = GameService.initializeGame(gameId, shuffledDeck);
  
  gameState.difficulty = difficulty;
  
  await this.gameRepository.save(gameState);
  return gameState;
}
```

**3. Modificar drawFromStock**
```typescript
// En GameService.ts
static drawFromStock(gameState: GameState): void {
  const count = gameState.difficulty === 'hard' ? 3 : 1;
  // ... lógica de robo con count variable
}
```

### Frontend

**1. Agregar selector de dificultad**
```vue
<!-- DifficultySelector.vue -->
<template>
  <div class="difficulty-selector">
    <label>Dificultad:</label>
    <select v-model="selectedDifficulty" @change="handleChange">
      <option value="easy">Fácil (1 carta)</option>
      <option value="normal">Normal (1 carta)</option>
      <option value="hard">Difícil (3 cartas)</option>
    </select>
  </div>
</template>
```

---

## 6. Agregar sonidos

### Frontend

**1. Crear servicio de sonidos**
```typescript
// frontend/src/infrastructure/audio/SoundService.ts
export class SoundService {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private enabled: boolean = true;

  constructor() {
    this.loadSounds();
  }

  private loadSounds(): void {
    this.sounds.set('cardFlip', new Audio('/sounds/card-flip.mp3'));
    this.sounds.set('cardPlace', new Audio('/sounds/card-place.mp3'));
    this.sounds.set('win', new Audio('/sounds/win.mp3'));
    this.sounds.set('error', new Audio('/sounds/error.mp3'));
  }

  play(soundName: string): void {
    if (!this.enabled) return;
    
    const sound = this.sounds.get(soundName);
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(err => console.warn('Error al reproducir sonido:', err));
    }
  }

  toggle(): void {
    this.enabled = !this.enabled;
  }
}
```

**2. Usar en composable**
```typescript
// En useGameState.ts
const soundService = new SoundService();

async function moveCards(...): Promise<boolean> {
  // ... lógica existente
  
  if (success) {
    soundService.play('cardPlace');
  } else {
    soundService.play('error');
  }
  
  return success;
}
```

---

## 7. Agregar estadísticas

### Backend

**1. Crear entidad Statistics**
```typescript
// backend/src/domain/entities/Statistics.ts
export interface Statistics {
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  totalScore: number;
  averageScore: number;
  bestScore: number;
  fastestWin: number; // en segundos
  totalTime: number; // en segundos
}
```

**2. Crear caso de uso**
```typescript
// backend/src/application/usecases/GetStatisticsUseCase.ts
export class GetStatisticsUseCase {
  constructor(private readonly gameRepository: GameRepository) {}

  async execute(): Promise<Statistics> {
    const allGames = await this.gameRepository.findAll();
    
    const stats: Statistics = {
      gamesPlayed: allGames.length,
      gamesWon: allGames.filter(g => g.status === 'WON').length,
      gamesLost: allGames.filter(g => g.status === 'LOST').length,
      totalScore: allGames.reduce((sum, g) => sum + g.score, 0),
      averageScore: 0,
      bestScore: Math.max(...allGames.map(g => g.score)),
      fastestWin: this.calculateFastestWin(allGames),
      totalTime: this.calculateTotalTime(allGames)
    };

    stats.averageScore = stats.gamesPlayed > 0 
      ? stats.totalScore / stats.gamesPlayed 
      : 0;

    return stats;
  }

  private calculateFastestWin(games: any[]): number {
    const wonGames = games.filter(g => g.status === 'WON');
    if (wonGames.length === 0) return 0;

    const times = wonGames.map(g => {
      const start = new Date(g.startTime).getTime();
      const end = new Date(g.endTime).getTime();
      return (end - start) / 1000;
    });

    return Math.min(...times);
  }

  private calculateTotalTime(games: any[]): number {
    return games.reduce((sum, g) => {
      const start = new Date(g.startTime).getTime();
      const end = g.endTime ? new Date(g.endTime).getTime() : Date.now();
      return sum + ((end - start) / 1000);
    }, 0);
  }
}
```

### Frontend

**1. Crear componente de estadísticas**
```vue
<!-- StatisticsPanel.vue -->
<template>
  <div class="statistics-panel">
    <h2>📊 Estadísticas</h2>
    
    <div class="stat-row">
      <span class="stat-label">Partidas jugadas:</span>
      <span class="stat-value">{{ stats.gamesPlayed }}</span>
    </div>
    
    <div class="stat-row">
      <span class="stat-label">Victorias:</span>
      <span class="stat-value">{{ stats.gamesWon }}</span>
    </div>
    
    <div class="stat-row">
      <span class="stat-label">Derrotas:</span>
      <span class="stat-value">{{ stats.gamesLost }}</span>
    </div>
    
    <div class="stat-row">
      <span class="stat-label">Mejor puntaje:</span>
      <span class="stat-value">{{ stats.bestScore }}</span>
    </div>
    
    <div class="stat-row">
      <span class="stat-label">Victoria más rápida:</span>
      <span class="stat-value">{{ formatTime(stats.fastestWin) }}</span>
    </div>
  </div>
</template>
```

---

## 🎯 Consejos Generales

### Al agregar nuevas features:

1. **Empieza por el dominio**
   - Define entidades y reglas primero
   - Escribe tests para la lógica de negocio

2. **Crea el caso de uso**
   - Mantén la lógica simple y directa
   - Inyecta dependencias necesarias

3. **Implementa la infraestructura**
   - Agrega endpoints HTTP si es necesario
   - Crea implementaciones concretas

4. **Actualiza el frontend**
   - Agrega métodos al API client
   - Actualiza el composable
   - Crea/modifica componentes Vue

5. **Documenta y testea**
   - Escribe tests unitarios
   - Actualiza documentación
   - Prueba manualmente

### Mantén Clean Architecture:

✅ **DO**:
- Mantén el dominio independiente
- Usa inyección de dependencias
- Escribe tests para lógica crítica
- Sigue los principios SOLID

❌ **DON'T**:
- No pongas lógica de negocio en controllers
- No uses clases concretas en el dominio
- No mezcles capas
- No ignores la separación de responsabilidades

---

**¿Necesitas ayuda?** Revisa los ejemplos existentes en el código. Cada capa está bien documentada y puedes usar los patrones como referencia.
