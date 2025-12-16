<template>
  <div class="card" :class="cardClasses" @click="handleClick">
    <div v-if="card.faceUp" class="card-content">
      <!-- Esquina superior izquierda -->
      <div class="card-corner top-left" :class="`color-${color}`">
        <div class="corner-rank">{{ card.rank }}</div>
        <div class="corner-suit">{{ suitSymbol }}</div>
      </div>
      
      <!-- Símbolo central -->
      <div class="card-center" :class="`color-${color}`">
        {{ suitSymbol }}
      </div>
      
      <!-- Esquina inferior derecha (invertida) -->
      <div class="card-corner bottom-right" :class="`color-${color}`">
        <div class="corner-rank">{{ card.rank }}</div>
        <div class="corner-suit">{{ suitSymbol }}</div>
      </div>
    </div>
    <div v-else class="card-back">
      <div class="card-pattern"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Card as CardType } from '../../domain/types';

interface Props {
  card: CardType;
  draggable?: boolean;
  clickable?: boolean;
}

interface Emits {
  (e: 'click', card: CardType): void;
}

const props = withDefaults(defineProps<Props>(), {
  draggable: false,
  clickable: false
});

const emit = defineEmits<Emits>();

const color = computed(() => {
  return props.card.suit === 'HEARTS' || props.card.suit === 'DIAMONDS' ? 'red' : 'black';
});

const suitSymbol = computed(() => {
  const symbols: Record<string, string> = {
    HEARTS: '♥',
    DIAMONDS: '♦',
    CLUBS: '♣',
    SPADES: '♠'
  };
  return symbols[props.card.suit] || '';
});

const cardClasses = computed(() => ({
  'face-up': props.card.faceUp,
  'face-down': !props.card.faceUp,
  'draggable': props.draggable,
  'clickable': props.clickable
}));

function handleClick() {
  if (props.clickable) {
    emit('click', props.card);
  }
}
</script>

<style scoped>
.card {
  width: 80px;
  height: 112px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  position: relative;
  transition: all 0.2s ease;
  user-select: none;
  touch-action: none;
}

.card.clickable:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  cursor: pointer;
}

.card.draggable {
  cursor: grab;
}

.card.draggable:active {
  cursor: grabbing;
}

/* Carta boca arriba */
.card-content {
  width: 100%;
  height: 100%;
  background: white;
  border: 2px solid #333;
  border-radius: 8px;
  position: relative;
  padding: 4px;
}

/* Esquinas de la carta */
.card-corner {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1;
}

.card-corner.top-left {
  top: 4px;
  left: 6px;
}

.card-corner.bottom-right {
  bottom: 4px;
  right: 6px;
  transform: rotate(180deg);
}

.corner-rank {
  font-size: 18px;
  font-weight: bold;
  line-height: 1;
}

.corner-suit {
  font-size: 16px;
  line-height: 1;
  margin-top: 1px;
}

/* Símbolo central */
.card-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 42px;
  line-height: 1;
  opacity: 0.9;
}

.color-red {
  color: #d32f2f;
}

.color-black {
  color: #212121;
}

/* Carta boca abajo */
.card-back {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  border: 2px solid #0d47a1;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.card-pattern {
  width: 80%;
  height: 80%;
  background-image: 
    repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px),
    repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px);
}

/* Tablets */
@media (max-width: 768px) {
  .card {
    width: 65px;
    height: 91px;
  }

  .corner-rank {
    font-size: 15px;
  }

  .corner-suit {
    font-size: 13px;
  }

  .card-center {
    font-size: 34px;
  }

  .card-corner.top-left {
    top: 3px;
    left: 5px;
  }

  .card-corner.bottom-right {
    bottom: 3px;
    right: 5px;
  }
}

/* Mobile */
@media (max-width: 480px) {
  .card {
    width: 50px;
    height: 70px;
  }

  .corner-rank {
    font-size: 12px;
  }

  .corner-suit {
    font-size: 11px;
  }

  .card-center {
    font-size: 26px;
  }

  .card-corner.top-left {
    top: 2px;
    left: 4px;
  }

  .card-corner.bottom-right {
    bottom: 2px;
    right: 4px;
  }
}

/* Dispositivos muy pequeños (300-320px) */
@media (max-width: 320px) {
  .card {
    width: 38px;
    height: 53px;
    border-radius: 3px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }

  .corner-rank {
    font-size: 9px;
  }

  .corner-suit {
    font-size: 8px;
  }

  .card-center {
    font-size: 18px;
  }

  .card-content {
    padding: 2px;
    border-width: 1px;
  }

  .card-corner.top-left {
    top: 1px;
    left: 2px;
  }

  .card-corner.bottom-right {
    bottom: 1px;
    right: 2px;
  }

  .card-back {
    border-width: 1px;
  }
}
</style>
