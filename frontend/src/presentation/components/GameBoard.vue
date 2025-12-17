<template>
  <div class="game-board">
    <!-- Área superior: Stock, Waste y Foundations -->
    <div class="top-area">
      <div class="left-section">
        <!-- Stock (Mazo) -->
        <Pile 
          :pile="gameState.stock"
          @pile-click="handleStockClick"
          @card-click="handleStockClick"
        />
        
        <!-- Waste (Descarte) -->
        <Pile 
          :pile="gameState.waste"
          @card-click="handleCardClick"
          @card-drop="handleCardDrop"
        />
      </div>

      <!-- Foundations (Bases) -->
      <div class="foundations">
        <Pile 
          v-for="foundation in gameState.foundationPiles"
          :key="foundation.id"
          :pile="foundation"
          @card-drop="handleCardDrop"
        />
      </div>
    </div>

    <!-- Área de Tableau (Mesa) -->
    <div class="tableau-area">
      <Pile 
        v-for="tableau in gameState.tableauPiles"
        :key="tableau.id"
        :pile="tableau"
        :stack-offset="25"
        @card-click="handleCardClick"
        @card-drop="handleCardDrop"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import Pile from './Pile.vue';
import type { GameState, Card, Pile as PileType } from '../../domain/types';
import { canMoveCardsToPile } from '../../utils/gameRules';
import { soundManager } from '../../utils/sounds';

interface Props {
  gameState: GameState;
}

interface Emits {
  (e: 'drawFromStock'): void;
  (e: 'moveCards', data: { fromPileId: string; toPileId: string; cardCount: number }): void;
  (e: 'cardClick', data: { card: Card; pileId: string }): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

function handleStockClick() {
  emit('drawFromStock');
}

function handleCardClick(data: { card: Card; pileId: string; cardIndex: number }) {
  emit('cardClick', {
    card: data.card,
    pileId: data.pileId
  });
}

function handleCardDrop(data: { fromPileId: string; toPileId: string; cardCount: number }) {
  // Encontrar las pilas origen y destino
  const allPiles: PileType[] = [
    props.gameState.stock,
    props.gameState.waste,
    ...props.gameState.tableauPiles,
    ...props.gameState.foundationPiles
  ];
  
  const fromPile = allPiles.find(p => p.id === data.fromPileId);
  const toPile = allPiles.find(p => p.id === data.toPileId);
  
  if (!fromPile || !toPile) {
    console.error('No se encontraron las pilas');
    return;
  }
  
  // Obtener las cartas a mover
  const fromIndex = fromPile.cards.length - data.cardCount;
  const cardsToMove = fromPile.cards.slice(fromIndex);
  
  // Validar el movimiento
  if (!canMoveCardsToPile(cardsToMove, toPile)) {
    // Reproducir sonido de error y no permitir el movimiento
    soundManager.play('error');
    console.log('Movimiento inválido: no se puede colocar esa carta aquí');
    return;
  }
  
  // Si es válido, emitir el evento
  emit('moveCards', data);
}
</script>

<style scoped>
.game-board {
  padding: clamp(2px, 3vw, 20px);
  min-height: calc(100vh - 150px);
  display: flex;
  flex-direction: column;
  gap: clamp(4px, 3vw, 20px);
}

.top-area {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: clamp(2px, 2.5vw, 16px);
}

.left-section {
  display: flex;
  gap: clamp(2px, 2.5vw, 16px);
}

.foundations {
  display: flex;
  gap: clamp(2px, 2.5vw, 16px);
}

.tableau-area {
  display: flex;
  gap: clamp(2px, 2.5vw, 16px);
  justify-content: center;
  flex: 1;
}

/* Responsive */
@media (max-width: 1200px) {
  .tableau-area {
    gap: 12px;
  }
}

/* Tablets */
@media (max-width: 768px) {
  .game-board {
    padding: 12px;
    gap: 20px;
  }

  .top-area {
    gap: 12px;
  }

  .left-section,
  .foundations {
    gap: 10px;
  }

  .tableau-area {
    gap: 8px;
  }
}

/* Móviles */
@media (max-width: 480px) {
  .game-board {
    padding: 8px;
    gap: 16px;
  }

  .top-area {
    flex-direction: column;
    width: 100%;
    gap: 12px;
  }

  .left-section,
  .foundations {
    gap: 8px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .tableau-area {
    gap: 6px;
    overflow-x: auto;
    justify-content: flex-start;
    padding-bottom: 8px;
  }
}

/* Pantallas pequeñas (320px) */
@media (max-width: 320px) {
  .game-board {
    padding: 2px;
    gap: 5px;
  }

  .top-area {
    gap: 4px;
    flex-wrap: nowrap;
  }

  .left-section,
  .foundations {
    gap: 3px;
  }

  .tableau-area {
    gap: 3px;
    padding-bottom: 6px;
  }

  .tableau-column {
    min-width: 34px;
  }
}

/* Dispositivos muy pequeños (250px) */
@media (max-width: 250px) {
  .game-board {
    padding: 1px;
    gap: 3px;
    min-height: auto;
  }

  .top-area {
    gap: 2px;
    flex-wrap: nowrap;
  }

  .left-section,
  .foundations {
    gap: 2px;
  }

  .tableau-area {
    gap: 2px;
    padding-bottom: 4px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .tableau-column {
    min-width: 32px;
  }
}

/* Orientación horizontal (Landscape) */
@media (max-height: 600px) and (orientation: landscape) {
  .game-board {
    padding: 8px;
    gap: 12px;
    min-height: auto;
  }

  .top-area {
    flex-direction: row;
    gap: 12px;
  }

  .tableau-area {
    gap: 6px;
  }
}

/* Landscape en móviles pequeños */
@media (max-width: 768px) and (max-height: 500px) and (orientation: landscape) {
  .game-board {
    padding: 4px;
    gap: 8px;
  }

  .top-area {
    gap: 8px;
  }

  .left-section,
  .foundations {
    gap: 6px;
  }

  .tableau-area {
    gap: 4px;
  }
}
</style>
