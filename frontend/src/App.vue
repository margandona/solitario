<template>
  <div id="app">
    <UpdatePrompt />
    
    <HeaderBar 
      v-if="gameState"
      :score="currentScore"
      :status="gameState.status"
      @new-game="handleNewGame"
      @auto-complete="handleAutoComplete"
    />

    <main class="main-content">
      <!-- Loading state -->
      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Cargando...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="error-container">
        <p class="error-message">{{ error }}</p>
        <button class="btn-retry" @click="handleNewGame">Reintentar</button>
      </div>

      <!-- Game board -->
      <GameBoard 
        v-else-if="gameState"
        :game-state="gameState"
        @draw-from-stock="handleDrawFromStock"
        @move-cards="handleMoveCards"
        @card-click="handleCardClick"
      />

      <!-- Initial state -->
      <div v-else class="welcome-container">
        <h1>🃏 Solitario para la Abuelita</h1>
        <p>Bienvenida a tu juego de solitario favorito</p>
        <button class="btn-start" @click="handleNewGame">Comenzar Juego</button>
      </div>
    </main>

    <!-- Modal de mensajes lindos -->
    <NiceMessageModal 
      :show="showModal"
      :type="modalType"
      :message="modalMessage"
      @close="handleCloseModal"
    />

    <!-- Prompt de instalación PWA -->
    <InstallPrompt />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import HeaderBar from './presentation/components/HeaderBar.vue';
import GameBoard from './presentation/components/GameBoard.vue';
import NiceMessageModal from './presentation/components/NiceMessageModal.vue';
import InstallPrompt from './presentation/components/InstallPrompt.vue';
import UpdatePrompt from './presentation/components/UpdatePrompt.vue';
import { useGameState } from './application/useGameState';
import { getRandomNiceMessage, type MessageType } from './utils/niceMessages';
import { soundManager } from './utils/sounds';
import { useFullscreen } from './utils/useFullscreen';
import type { Card } from './domain/types';

const {
  gameState,
  loading,
  error,
  currentScore,
  hasWon,
  hasLost,
  startNewGame,
  drawFromStock,
  moveCards,
  autoComplete
} = useGameState();

const { isFullscreen, toggleFullscreen } = useFullscreen();

const showModal = ref(false);
const modalType = ref<'start' | 'win' | 'lose' | 'info'>('start');
const modalMessage = ref('');

// Tracking para combos y paciencia
const consecutiveFoundationMoves = ref(0);
const lastMoveTime = ref(Date.now());
let patienceTimer: number | null = null;

/**
 * Obtiene el momento del día para mensajes personalizados
 */
function getTimeOfDay(): MessageType {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 24) return 'evening';
  return 'night';
}

/**
 * Inicia el timer de paciencia
 */
function startPatienceTimer() {
  if (patienceTimer) {
    clearTimeout(patienceTimer);
  }
  
  // Si pasan 90 segundos sin mover, mostrar mensaje de ánimo
  patienceTimer = window.setTimeout(() => {
    if (gameState.value?.status === 'PLAYING') {
      showPatienceMessage();
    }
  }, 90000); // 90 segundos
}

/**
 * Resetea el timer de paciencia
 */
function resetPatienceTimer() {
  if (patienceTimer) {
    clearTimeout(patienceTimer);
    patienceTimer = null;
  }
  lastMoveTime.value = Date.now();
  startPatienceTimer();
}

/**
 * Muestra mensaje de paciencia
 */
function showPatienceMessage() {
  modalType.value = 'info';
  modalMessage.value = getRandomNiceMessage('patience');
  showModal.value = true;
  soundManager.play('card-flip');
}

/**
 * Muestra mensaje de combo
 */
function showComboMessage() {
  modalType.value = 'info';
  modalMessage.value = getRandomNiceMessage('combo');
  showModal.value = true;
  soundManager.play('win');
}

/**
 * Muestra mensaje de foundation
 */
function showFoundationMessage() {
  modalType.value = 'info';
  modalMessage.value = getRandomNiceMessage('foundation');
  showModal.value = true;
}

// Iniciar juego al montar
onMounted(() => {
  // Opcional: auto-iniciar o esperar a que el usuario haga clic
  // handleNewGame();
  startPatienceTimer();
});

onUnmounted(() => {
  if (patienceTimer) {
    clearTimeout(patienceTimer);
  }
});

// Vigilar cambios en el estado del juego
watch(hasWon, (won) => {
  if (won) {
    showWinMessage();
  }
});

watch(hasLost, (lost) => {
  if (lost) {
    showLoseMessage();
  }
});

async function handleNewGame() {
  await startNewGame();
  if (gameState.value) {
    consecutiveFoundationMoves.value = 0;
    resetPatienceTimer();
    showStartMessage();
  }
}

async function handleDrawFromStock() {
  soundManager.play('card-flip');
  resetPatienceTimer();
  await drawFromStock(1);
}

async function handleMoveCards(data: { fromPileId: string; toPileId: string; cardCount: number }) {
  try {
    console.log('Moviendo cartas:', data);
    
    // Resetear timer de paciencia
    resetPatienceTimer();
    
    // Sonido diferente si es a foundation o tableau
    if (data.toPileId.includes('foundation')) {
      soundManager.play('card-place');
      
      // Tracking de movimientos consecutivos a foundation
      consecutiveFoundationMoves.value++;
      
      // Mostrar mensaje de foundation ocasionalmente (20% chance)
      if (Math.random() < 0.2) {
        setTimeout(() => showFoundationMessage(), 300);
      }
      
      // Si hace 4+ movimientos seguidos a foundation, es un combo!
      if (consecutiveFoundationMoves.value >= 4) {
        setTimeout(() => {
          showComboMessage();
          consecutiveFoundationMoves.value = 0;
        }, 500);
      }
    } else {
      soundManager.play('card-move');
      // Movimiento a tableau resetea el combo
      consecutiveFoundationMoves.value = 0;
    }
    
    await moveCards(data.fromPileId, data.toPileId, data.cardCount);
  } catch (error: any) {
    console.error('Error al mover cartas:', error);
    soundManager.play('error');
    consecutiveFoundationMoves.value = 0;
    // Mostrar mensaje al usuario si es necesario
    alert(error.message || 'No se puede mover la carta a esa posición');
  }
}

async function handleAutoComplete() {
  soundManager.play('auto-complete');
  const movedCount = await autoComplete();
  if (movedCount > 0) {
    console.log(`Se movieron ${movedCount} cartas automáticamente`);
  }
}

function handleCardClick(data: { card: Card; pileId: string }) {
  // Aquí se podría implementar lógica adicional para clicks en cartas
  console.log('Card clicked:', data);
}

function showStartMessage() {
  modalType.value = 'start';
  // Usar mensaje según hora del día, con 50% de probabilidad
  const useTimeMessage = Math.random() < 0.5;
  const messageType: MessageType = useTimeMessage ? getTimeOfDay() : 'start';
  modalMessage.value = getRandomNiceMessage(messageType);
  showModal.value = true;
}

function showWinMessage() {
  soundManager.play('win');
  modalType.value = 'win';
  modalMessage.value = getRandomNiceMessage('win');
  showModal.value = true;
}

function showLoseMessage() {
  soundManager.play('error');
  modalType.value = 'lose';
  modalMessage.value = getRandomNiceMessage('lose');
  showModal.value = true;
}

function handleCloseModal() {
  showModal.value = false;
}
</script>

<style>
/* Reset y estilos globales */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  background-attachment: fixed;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Loading */
.loading-container {
  text-align: center;
  padding: 32px;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(46, 125, 50, 0.2);
  border-top-color: #2E7D32;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Error */
.error-container {
  text-align: center;
  padding: 32px;
}

.error-message {
  color: #d32f2f;
  font-size: 18px;
  margin-bottom: 16px;
}

.btn-retry {
  background: #2E7D32;
  color: white;
  border: none;
  border-radius: 24px;
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-retry:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(46, 125, 50, 0.3);
}

/* Welcome */
.welcome-container {
  text-align: center;
  padding: 48px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  max-width: 500px;
}

.welcome-container h1 {
  font-size: 36px;
  color: #2E7D32;
  margin-bottom: 16px;
}

.welcome-container p {
  font-size: 20px;
  color: #666;
  margin-bottom: 32px;
}

.btn-start {
  background: linear-gradient(135deg, #4caf50 0%, #2E7D32 100%);
  color: white;
  border: none;
  border-radius: 24px;
  padding: 16px 48px;
  font-size: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.btn-start:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(76, 175, 80, 0.4);
}

.btn-start:active {
  transform: translateY(0);
}

/* Responsive */
@media (max-width: 768px) {
  .welcome-container {
    padding: 32px 24px;
    margin: 16px;
  }

  .welcome-container h1 {
    font-size: 28px;
  }

  .welcome-container p {
    font-size: 18px;
  }

  .btn-start {
    font-size: 18px;
    padding: 14px 40px;
  }
}
</style>
