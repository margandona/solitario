/**
 * FRONTEND - Composable para manejar el estado del juego
 * 
 * Este composable actúa como la capa de aplicación en el frontend,
 * orquestando las llamadas a la API y manteniendo el estado reactivo.
 */

import { ref, computed, Ref } from 'vue';
import { GameApiClient } from '../infrastructure/api/GameApiClient';
import type { GameState, Card } from '../domain/types';

export function useGameState() {
  const apiClient = new GameApiClient();
  
  const gameState: Ref<GameState | null> = ref(null);
  const loading = ref(false);
  const error: Ref<string | null> = ref(null);

  // Estado computado
  const isPlaying = computed(() => gameState.value?.status === 'PLAYING');
  const hasWon = computed(() => gameState.value?.status === 'WON');
  const hasLost = computed(() => gameState.value?.status === 'LOST');
  const currentScore = computed(() => gameState.value?.score || 0);

  /**
   * Inicia una nueva partida
   */
  async function startNewGame(): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      gameState.value = await apiClient.startNewGame();
    } catch (e) {
      error.value = (e as Error).message;
      console.error('Error al iniciar juego:', e);
    } finally {
      loading.value = false;
    }
  }

  /**
   * Roba cartas del stock esperando respuesta del servidor
   */
  async function drawFromStock(count: number = 1): Promise<void> {
    if (!gameState.value) return;

    try {
      // Esperar la respuesta del servidor ANTES de actualizar localmente
      const serverState = await apiClient.drawFromStock(gameState.value.id, count);
      
      // Actualizar con el estado del servidor (autoridad)
      gameState.value = serverState;
    } catch (e) {
      // Si falla, no hacer nada (el estado permanece igual)
      error.value = (e as Error).message;
      console.error('Error al robar cartas:', e);
    }
  }

  /**
   * Mueve carta(s) de una pila a otra SIN actualización optimista
   * Espera la respuesta del servidor antes de actualizar el estado
   */
  async function moveCards(
    fromPileId: string,
    toPileId: string,
    cardCount: number = 1
  ): Promise<boolean> {
    if (!gameState.value) return false;

    try {
      // Esperar la respuesta del servidor ANTES de actualizar localmente
      const serverState = await apiClient.moveCards(
        gameState.value.id,
        fromPileId,
        toPileId,
        cardCount
      );
      
      // Actualizar con el estado del servidor (autoridad)
      gameState.value = serverState;
      
      return true;
    } catch (e) {
      // Si falla, no hacer nada (el estado permanece igual)
      error.value = (e as Error).message;
      console.error('Error al mover cartas:', e);
      throw e; // Re-lanzar para que App.vue lo maneje
    }
  }

  /**
   * Función auxiliar para encontrar una pila por ID
   */
  function findPileById(pileId: string) {
    if (!gameState.value) return null;
    
    // Buscar en tableau
    const tableau = gameState.value.tableauPiles.find(p => p.id === pileId);
    if (tableau) return tableau;
    
    // Buscar en foundations
    const foundation = gameState.value.foundationPiles.find(p => p.id === pileId);
    if (foundation) return foundation;
    
    // Buscar en stock/waste
    if (gameState.value.stock.id === pileId) return gameState.value.stock;
    if (gameState.value.waste.id === pileId) return gameState.value.waste;
    
    return null;
  }

  /**
   * Auto-completa movimientos a las foundations
   */
  async function autoComplete(): Promise<number> {
    if (!gameState.value) return 0;

    loading.value = true;
    error.value = null;

    try {
      const result = await apiClient.autoCompleteFoundations(gameState.value.id);
      gameState.value = result.gameState;
      return result.movedCount;
    } catch (e) {
      error.value = (e as Error).message;
      console.error('Error al auto-completar:', e);
      return 0;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Valida un movimiento sin ejecutarlo
   */
  async function validateMove(
    fromPileId: string,
    toPileId: string,
    cardCount: number = 1
  ): Promise<{ valid: boolean; reason?: string }> {
    if (!gameState.value) {
      return { valid: false, reason: 'No hay partida activa' };
    }

    try {
      return await apiClient.validateMove(
        gameState.value.id,
        fromPileId,
        toPileId,
        cardCount
      );
    } catch (e) {
      return { valid: false, reason: (e as Error).message };
    }
  }

  /**
   * Obtiene el color de una carta
   */
  function getCardColor(card: Card): 'red' | 'black' {
    return card.suit === 'HEARTS' || card.suit === 'DIAMONDS' ? 'red' : 'black';
  }

  /**
   * Obtiene el símbolo del palo
   */
  function getSuitSymbol(suit: string): string {
    const symbols: Record<string, string> = {
      HEARTS: '♥',
      DIAMONDS: '♦',
      CLUBS: '♣',
      SPADES: '♠'
    };
    return symbols[suit] || '';
  }

  return {
    // Estado
    gameState,
    loading,
    error,
    
    // Computed
    isPlaying,
    hasWon,
    hasLost,
    currentScore,
    
    // Métodos
    startNewGame,
    drawFromStock,
    moveCards,
    autoComplete,
    validateMove,
    getCardColor,
    getSuitSymbol
  };
}
