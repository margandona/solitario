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
   * Roba cartas del stock con actualización optimista
   */
  async function drawFromStock(count: number = 1): Promise<void> {
    if (!gameState.value) return;

    const previousState = JSON.parse(JSON.stringify(gameState.value));

    try {
      // Actualización optimista local
      if (gameState.value.stock.cards.length > 0) {
        // Mover cartas de stock a waste
        const cardsToMove = gameState.value.stock.cards.splice(-count, count);
        cardsToMove.forEach(card => {
          card.faceUp = true;
        });
        gameState.value.waste.cards.push(...cardsToMove);
      } else if (gameState.value.waste.cards.length > 0) {
        // Reciclar: mover todas de waste a stock
        const wasteCards = gameState.value.waste.cards.splice(0);
        wasteCards.reverse().forEach(card => {
          card.faceUp = false;
        });
        gameState.value.stock.cards.push(...wasteCards);
      }
    } catch (localError) {
      console.error('Error en actualización optimista de draw:', localError);
      return;
    }

    // Sincronizar con servidor
    try {
      const serverState = await apiClient.drawFromStock(previousState.id, count);
      
      // Solo actualizar campos que pueden diferir
      if (gameState.value) {
        gameState.value.status = serverState.status;
        gameState.value.score = serverState.score;
        gameState.value.moves = serverState.moves;
      }
    } catch (e) {
      // Revertir si falla
      gameState.value = previousState;
      error.value = (e as Error).message;
      console.error('Error al robar cartas, revirtiendo:', e);
    }
  }

  /**
   * Mueve carta(s) de una pila a otra con actualización optimista
   */
  async function moveCards(
    fromPileId: string,
    toPileId: string,
    cardCount: number = 1
  ): Promise<boolean> {
    if (!gameState.value) return false;

    // Guardamos el estado anterior por si necesitamos revertir
    const previousState = JSON.parse(JSON.stringify(gameState.value));
    
    // Actualización optimista local (sin esperar al servidor)
    try {
      // Encontrar las pilas
      const fromPile = findPileById(fromPileId);
      const toPile = findPileById(toPileId);
      
      if (!fromPile || !toPile) {
        throw new Error('Pila no encontrada');
      }

      // Mover las cartas localmente
      const cardsToMove = fromPile.cards.splice(-cardCount, cardCount);
      toPile.cards.push(...cardsToMove);
      
      // Si la pila de origen es tableau y quedó con cartas, voltear la superior
      if (fromPile.type === 'TABLEAU' && fromPile.cards.length > 0) {
        fromPile.cards[fromPile.cards.length - 1].faceUp = true;
      }
      
      // Actualizar score localmente si es movimiento a foundation
      if (toPile.type === 'FOUNDATION' && gameState.value) {
        gameState.value.score += 10;
      }
    } catch (localError) {
      // Si falla la actualización local, no continuar
      console.error('Error en actualización optimista:', localError);
      return false;
    }

    // Ahora sincronizar con el servidor en background
    try {
      const serverState = await apiClient.moveCards(
        previousState.id,
        fromPileId,
        toPileId,
        cardCount
      );
      
      // Actualizar solo campos que el servidor puede cambiar
      if (gameState.value) {
        gameState.value.status = serverState.status;
        gameState.value.score = serverState.score;
        gameState.value.moves = serverState.moves;
        
        // Solo si el servidor indica victoria o derrota, reemplazar todo
        if (serverState.status !== 'PLAYING') {
          gameState.value = serverState;
        }
      }
      
      return true;
    } catch (e) {
      // Si falla el servidor, revertir al estado anterior
      gameState.value = previousState;
      error.value = (e as Error).message;
      console.error('Error al mover cartas, revirtiendo:', e);
      return false;
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
