<template>
  <header class="header-bar">
    <div class="header-content">
      <div class="title-section">
        <h1 class="game-title">🃏 Solitario para la Abuelita</h1>
        <span class="version-badge">{{ version }}</span>
      </div>
      
      <div class="header-info">
        <div class="score-display">
          Puntaje: <strong>{{ score }}</strong>
        </div>
        
        <div class="game-status" :class="statusClass">
          {{ statusText }}
        </div>
      </div>

      <div class="header-actions">
        <button 
          class="btn btn-sound" 
          @click="handleToggleSound"
          :title="soundEnabled ? 'Silenciar sonidos' : 'Activar sonidos'"
        >
          {{ soundEnabled ? '🔊' : '🔇' }}
        </button>
        
        <button 
          class="btn btn-auto" 
          @click="handleAutoComplete"
          :disabled="!canAutoComplete"
          title="Mover cartas seguras a las bases automáticamente"
        >
          ✨ Auto
        </button>
        
        <button 
          class="btn btn-new" 
          @click="handleNewGame"
          title="Nueva partida"
        >
          🔄 Nuevo Juego
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { getVersionString } from '../../version';
import { soundManager } from '../../utils/sounds';

interface Props {
  score: number;
  status: 'PLAYING' | 'WON' | 'LOST';
}

interface Emits {
  (e: 'newGame'): void;
  (e: 'autoComplete'): void;
}

const version = getVersionString();

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Ref reactivo para el estado del sonido
const soundEnabled = ref(soundManager.isEnabled());

// Suscribirse a cambios en el soundManager
let unsubscribe: (() => void) | null = null;

onMounted(() => {
  unsubscribe = soundManager.subscribe(() => {
    soundEnabled.value = soundManager.isEnabled();
  });
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});

const statusText = computed(() => {
  const texts: Record<string, string> = {
    PLAYING: 'Jugando',
    WON: '¡Ganaste! 🏆',
    LOST: 'Fin del juego'
  };
  return texts[props.status] || '';
});

const statusClass = computed(() => ({
  'status-playing': props.status === 'PLAYING',
  'status-won': props.status === 'WON',
  'status-lost': props.status === 'LOST'
}));

const canAutoComplete = computed(() => props.status === 'PLAYING');

function handleNewGame() {
  emit('newGame');
}

function handleAutoComplete() {
  if (canAutoComplete.value) {
    emit('autoComplete');
  }
}

function handleToggleSound() {
  soundManager.toggle();
  // Reproducir un sonido de prueba cuando se activa
  if (soundManager.isEnabled()) {
    soundManager.play('card-flip');
  }
}
</script>

<style scoped>
.header-bar {
  background: linear-gradient(135deg, #2E7D32 0%, #388E3C 100%);
  color: white;
  padding: 16px 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.game-title {
  font-size: 28px;
  font-weight: bold;
  margin: 0;
  white-space: nowrap;
}

.version-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.header-info {
  display: flex;
  gap: 24px;
  align-items: center;
}

.score-display {
  font-size: 18px;
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 20px;
}

.score-display strong {
  font-size: 22px;
}

.game-status {
  font-size: 18px;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
}

.status-playing {
  background: rgba(255, 255, 255, 0.2);
}

.status-won {
  background: #ffd700;
  color: #2E7D32;
}

.status-lost {
  background: rgba(255, 255, 255, 0.3);
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.btn:active:not(:disabled) {
  transform: translateY(0);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-sound {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  padding: 12px 16px;
  font-size: 20px;
}

.btn-sound:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.25);
}

.btn-auto {
  background: rgba(255, 255, 255, 0.9);
  color: #2E7D32;
}

.btn-new {
  background: #FF6F00;
  color: white;
}

/* Responsive */
@media (max-width: 768px) {
  .header-bar {
    padding: 12px 16px;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .title-section {
    justify-content: center;
  }

  .game-title {
    font-size: 22px;
    text-align: center;
  }

  .version-badge {
    font-size: 11px;
    padding: 3px 10px;
  }

  .header-info {
    justify-content: center;
    flex-wrap: wrap;
    gap: 12px;
  }

  .header-actions {
    justify-content: center;
  }

  .score-display,
  .game-status {
    font-size: 16px;
    padding: 6px 12px;
  }

  .btn {
    flex: 1;
    padding: 10px 20px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .header-bar {
    padding: 10px 12px;
  }

  .game-title {
    font-size: 18px;
  }

  .version-badge {
    font-size: 10px;
    padding: 2px 8px;
  }

  .score-display,
  .game-status {
    font-size: 14px;
    padding: 5px 10px;
  }

  .btn {
    padding: 8px 16px;
    font-size: 13px;
  }
}

/* Orientación horizontal */
@media (max-height: 600px) and (orientation: landscape) {
  .header-bar {
    padding: 8px 16px;
  }

  .header-content {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 12px;
  }

  .game-title {
    font-size: 20px;
  }

  .version-badge {
    font-size: 10px;
  }

  .score-display,
  .game-status {
    font-size: 14px;
    padding: 4px 10px;
  }

  .btn {
    padding: 6px 14px;
    font-size: 13px;
  }
}
</style>
