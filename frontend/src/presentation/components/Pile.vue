<template>
  <div 
    ref="pileElement"
    class="pile" 
    :class="pileClasses"
    @click="handlePileClick"
    @drop="handleDrop"
    @dragover.prevent
    @dragenter="handleDragEnter"
    @dragleave="handleDragLeave"
  >
    <!-- Placeholder para pila vacía -->
    <div v-if="pile.cards.length === 0" class="pile-placeholder">
      <span v-if="pile.type === 'FOUNDATION'" class="placeholder-text">
        {{ getSuitSymbol(pile.foundationSuit) }}
      </span>
      <span v-else-if="pile.type === 'TABLEAU'" class="placeholder-text">K</span>
      <span v-else class="placeholder-text">Vacío</span>
    </div>

    <!-- Cartas en la pila -->
    <div 
      v-for="(card, index) in displayCards" 
      :key="card.id"
      :style="getCardStyle(index)"
      class="card-wrapper"
      :draggable="canDragCard(card, index)"
      @dragstart="handleDragStart(card, index, $event)"
      @click.stop="handleCardClick(card, index)"
      @touchstart="handleTouchStart(card, index, $event)"
      @touchmove.prevent="handleTouchMove($event)"
      @touchend="handleTouchEnd($event)"
      @touchcancel="handleTouchCancel"
    >
      <Card 
        :card="card" 
        :clickable="canClickCard(card, index)"
        :draggable="canDragCard(card, index)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import Card from './Card.vue';
import type { Pile as PileType, Card as CardType } from '../../domain/types';
import { canMoveCardsToPile } from '../../utils/gameRules';
import { touchDragManager } from '../../utils/touchDragDrop';

interface Props {
  pile: PileType;
  stackOffset?: number;
  allPiles?: PileType[]; // Para acceder a la pila de origen durante validación
}

interface Emits {
  (e: 'cardClick', data: { card: CardType; pileId: string; cardIndex: number }): void;
  (e: 'pileClick', pileId: string): void;
  (e: 'cardDrop', data: { fromPileId: string; toPileId: string; cardCount: number }): void;
}

const props = withDefaults(defineProps<Props>(), {
  stackOffset: 28
});

const emit = defineEmits<Emits>();

const pileElement = ref<HTMLElement | null>(null);
const isDragOver = ref(false);
const isValidDrop = ref(false);
const dragData = ref<{ pileId: string; cardIndex: number; cardCount: number; cards?: CardType[] } | null>(null);
const touchStartTime = ref(0);
const isTouchDragging = ref(false);

const displayCards = computed(() => {
  // Para STOCK y WASTE, mostrar solo la carta superior
  if (props.pile.type === 'STOCK' || props.pile.type === 'WASTE') {
    return props.pile.cards.length > 0 ? [props.pile.cards[props.pile.cards.length - 1]] : [];
  }
  // Para TABLEAU y FOUNDATION, mostrar todas las cartas
  return props.pile.cards;
});

const pileClasses = computed(() => ({
  [`pile-${props.pile.type.toLowerCase()}`]: true,
  'pile-empty': props.pile.cards.length === 0,
  'drag-over': isDragOver.value
}));

function getCardStyle(index: number) {
  // Para tableau, apilar cartas con offset vertical
  if (props.pile.type === 'TABLEAU' && index > 0) {
    // Calcular offset responsivo basado en el ancho de ventana
    let offset = props.stackOffset;
    
    // Ajustar offset para dispositivos pequeños (más visible)
    if (window.innerWidth <= 320) {
      offset = Math.floor(props.stackOffset * 0.68); // 68% para pantallas pequeñas - ~19px
    } else if (window.innerWidth <= 480) {
      offset = Math.floor(props.stackOffset * 0.82); // 82% para móviles - ~23px
    } else if (window.innerWidth <= 768) {
      offset = Math.floor(props.stackOffset * 0.9); // 90% para tablets - ~25px
    }
    
    return {
      position: 'absolute',
      top: `${index * offset}px`,
      left: 0,
      zIndex: index
    };
  }
  return {};
}

function canDragCard(card: CardType, index: number): boolean {
  // Solo se pueden arrastrar cartas boca arriba
  if (!card.faceUp) return false;
  
  // En WASTE, solo la carta superior
  if (props.pile.type === 'WASTE') {
    return index === props.pile.cards.length - 1;
  }
  
  // En TABLEAU, cualquier carta visible
  if (props.pile.type === 'TABLEAU') {
    return true;
  }
  
  // No se puede arrastrar desde STOCK o FOUNDATION (por ahora)
  return false;
}

function canClickCard(card: CardType, index: number): boolean {
  if (props.pile.type === 'STOCK') return true;
  return card.faceUp;
}

function handleCardClick(card: CardType, index: number) {
  emit('cardClick', {
    card,
    pileId: props.pile.id,
    cardIndex: index
  });
}

function handlePileClick() {
  if (props.pile.cards.length === 0) {
    emit('pileClick', props.pile.id);
  }
}

function handleDragStart(card: CardType, index: number, event: DragEvent) {
  if (!canDragCard(card, index)) return;
  
  // Calcular cuántas cartas se van a mover (desde la carta arrastrada hasta el final)
  const cardCount = props.pile.cards.length - index;
  const cardsToMove = props.pile.cards.slice(index);
  
  dragData.value = {
    pileId: props.pile.id,
    cardIndex: index,
    cardCount: cardCount,
    cards: cardsToMove
  };
  
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('application/json', JSON.stringify({
      pileId: props.pile.id,
      cardIndex: index,
      cardCount: cardCount
    }));
  }
}

function handleDragEnter(event: DragEvent) {
  if (!event.dataTransfer) return;
  
  try {
    const data = JSON.parse(event.dataTransfer.getData('application/json'));
    
    // No validar si es la misma pila
    if (data.pileId === props.pile.id) {
      isDragOver.value = false;
      isValidDrop.value = false;
      return;
    }
    
    // Extraer las cartas desde los datos (necesitamos reconstruirlas)
    // Por ahora, marcar como válido si hay datos
    isDragOver.value = true;
    isValidDrop.value = true;
  } catch (e) {
    isDragOver.value = true;
    isValidDrop.value = false;
  }
}

function handleDragLeave() {
  isDragOver.value = false;
  isValidDrop.value = false;
}

function handleDrop(event: DragEvent) {
  event.preventDefault();
  
  const wasValidDrop = isValidDrop.value;
  isDragOver.value = false;
  isValidDrop.value = false;
  
  if (!event.dataTransfer) return;
  
  try {
    const data = JSON.parse(event.dataTransfer.getData('application/json'));
    
    // No permitir drop en la misma pila
    if (data.pileId === props.pile.id) {
      return;
    }
    
    // Emitir el evento solo si pasó la validación visual
    // La validación real se hará en el componente padre con todas las pilas
    emit('cardDrop', {
      fromPileId: data.pileId,
      toPileId: props.pile.id,
      cardCount: data.cardCount
    });
  } catch (e) {
    console.error('Error al procesar drop:', e);
  }
}

function getSuitSymbol(suit?: string): string {
  if (!suit) return '';
  const symbols: Record<string, string> = {
    HEARTS: '♥',
    DIAMONDS: '♦',
    CLUBS: '♣',
    SPADES: '♠'
  };
  return symbols[suit] || '';
}

// Touch event handlers
function handleTouchStart(card: CardType, index: number, event: TouchEvent) {
  if (!canDragCard(card, index)) return;
  
  touchStartTime.value = Date.now();
  const touch = event.touches[0];
  
  // Calcular cuántas cartas se van a mover
  const cardCount = props.pile.cards.length - index;
  const cardsToMove = props.pile.cards.slice(index);
  
  dragData.value = {
    pileId: props.pile.id,
    cardIndex: index,
    cardCount: cardCount,
    cards: cardsToMove
  };
  
  // Iniciar drag con el manager
  const target = event.currentTarget as HTMLElement;
  touchDragManager.startDrag({
    pileId: props.pile.id,
    cardIndex: index,
    cardCount: cardCount,
    startX: touch.clientX,
    startY: touch.clientY
  }, target);
  
  isTouchDragging.value = true;
}

function handleTouchMove(event: TouchEvent) {
  if (!isTouchDragging.value || !touchDragManager.isDragging()) return;
  
  const touch = event.touches[0];
  touchDragManager.updateGhostPosition(touch.clientX, touch.clientY);
  
  // Detectar sobre qué pila estamos
  const targetPileId = touchDragManager.findDropTarget(touch.clientX, touch.clientY);
  
  if (targetPileId && targetPileId !== props.pile.id) {
    isDragOver.value = true;
  } else if (isDragOver.value) {
    isDragOver.value = false;
  }
}

function handleTouchEnd(event: TouchEvent) {
  if (!isTouchDragging.value) return;
  
  const touch = event.changedTouches[0];
  const targetPileId = touchDragManager.findDropTarget(touch.clientX, touch.clientY);
  const dragInfo = touchDragManager.endDrag();
  
  isTouchDragging.value = false;
  isDragOver.value = false;
  
  // Si hay un target válido y no es la misma pila
  if (targetPileId && dragInfo.data && targetPileId !== dragInfo.data.pileId) {
    emit('cardDrop', {
      fromPileId: dragInfo.data.pileId,
      toPileId: targetPileId,
      cardCount: dragInfo.data.cardCount
    });
  }
  
  dragData.value = null;
}

function handleTouchCancel() {
  touchDragManager.cancelDrag();
  isTouchDragging.value = false;
  isDragOver.value = false;
  dragData.value = null;
}

// Lifecycle hooks
onMounted(() => {
  if (pileElement.value) {
    touchDragManager.registerDropTarget(props.pile.id, pileElement.value);
  }
});

onUnmounted(() => {
  touchDragManager.unregisterDropTarget(props.pile.id);
});
</script>

<style scoped>
.pile {
  min-height: clamp(45px, 16.8vw, 112px);
  min-width: clamp(32px, 12vw, 80px);
  border: 2px dashed #ccc;
  border-radius: clamp(2px, 0.8vw, 8px);
  position: relative;
  transition: all 0.2s ease;
  touch-action: none;
  -webkit-user-select: none;
  user-select: none;
}

.pile-tableau {
  min-height: clamp(200px, 60vw, 450px);
}

@media (max-width: 600px) {
  .pile {
    min-width: calc(45px + 3vw);
    min-height: calc(63px + 4.2vw);
  }
}

.pile-foundation,
.pile-waste,
.pile-stock {
  min-height: 112px;
  min-width: 80px;
}

.pile-stock:hover {
  cursor: pointer;
  border-color: #666;
  background-color: rgba(0, 0, 0, 0.02);
}

.pile.drag-over {
  border-color: #ff9800;
  border-style: solid;
  background-color: rgba(255, 152, 0, 0.1);
}

.pile.drag-over.valid-drop {
  border-color: #4caf50;
  background-color: rgba(76, 175, 80, 0.1);
}

.pile.drag-over.invalid-drop {
  border-color: #f44336;
  background-color: rgba(244, 67, 54, 0.1);
  cursor: not-allowed;
}

.pile-placeholder {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0.3;
}

.placeholder-text {
  font-size: 48px;
  color: #999;
}

.card-wrapper {
  position: relative;
  touch-action: none;
  -webkit-tap-highlight-color: transparent;
}

.card-wrapper:active {
  cursor: grabbing;
}

/* Tablets */
@media (max-width: 768px) {
  .pile {
    min-width: 65px;
    min-height: 91px;
  }

  .pile-tableau {
    min-height: 350px;
  }

  .placeholder-text {
    font-size: 36px;
  }
}

/* Móviles */
@media (max-width: 480px) {
  .pile {
    min-width: 50px;
    min-height: 70px;
    border-width: 1px;
  }

  .pile-tableau {
    min-height: 280px;
  }

  .placeholder-text {
    font-size: 24px;
  }
}

/* Pantallas pequeñas (320px) */
@media (max-width: 320px) {
  .pile {
    min-width: 36px;
    min-height: 50px;
    border-width: 1px;
    border-radius: 3px;
  }

  .pile-foundation,
  .pile-waste,
  .pile-stock {
    min-height: 50px;
    min-width: 36px;
  }

  .pile-tableau {
    min-height: 240px;
  }

  .placeholder-text {
    font-size: 20px;
  }
}

/* Dispositivos muy pequeños (250px) */
@media (max-width: 250px) {
  .pile {
    min-width: 32px;
    min-height: 45px;
    border-width: 1px;
    border-radius: 2px;
  }

  .pile-foundation,
  .pile-waste,
  .pile-stock {
    min-height: 45px;
    min-width: 32px;
  }

  .pile-tableau {
    min-height: 200px;
  }

  .placeholder-text {
    font-size: 16px;
    line-height: 1;
  }
}
</style>
