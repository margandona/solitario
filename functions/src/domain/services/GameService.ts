/**
 * CAPA DE DOMINIO - Servicio de Juego
 * 
 * Contiene la lógica de negocio pura para el juego de Solitario.
 * Este servicio implementa las reglas del juego Klondike.
 */

import { Card, Suit } from '../entities/Card';
import { Pile } from '../entities/Pile';
import { GameState } from '../entities/GameState';

export class GameService {
  /**
   * Inicializa un nuevo estado de juego a partir de un mazo barajado
   * 
   * Reparto inicial:
   * - Tableau: 7 columnas con 1, 2, 3, 4, 5, 6, 7 cartas respectivamente
   * - Solo la carta superior de cada columna está boca arriba
   * - El resto de cartas van al stock
   */
  static initializeGame(gameId: string, shuffledDeck: Card[]): GameState {
    if (shuffledDeck.length !== 52) {
      throw new Error('El mazo debe tener exactamente 52 cartas');
    }

    const cards = [...shuffledDeck];
    const tableauPiles: Pile[] = [];

    // Crear las 7 pilas del tableau
    let cardIndex = 0;
    for (let i = 0; i < 7; i++) {
      const pileCards: Card[] = [];
      
      // Cada pila i tiene i+1 cartas
      for (let j = 0; j <= i; j++) {
        const card = cards[cardIndex++];
        // Solo la última carta (superior) está boca arriba
        pileCards.push(j === i ? 
          new Card(card.id, card.rank, card.suit, true) : 
          new Card(card.id, card.rank, card.suit, false)
        );
      }

      tableauPiles.push(new Pile(`tableau-${i}`, 'TABLEAU', pileCards));
    }

    // Crear las 4 foundations (una por palo)
    const suits: Suit[] = ['HEARTS', 'DIAMONDS', 'CLUBS', 'SPADES'];
    const foundationPiles = suits.map((suit, index) => 
      new Pile(`foundation-${index}`, 'FOUNDATION', [], suit)
    );

    // El resto de cartas van al stock (boca abajo)
    const stockCards = cards.slice(cardIndex).map(card => 
      new Card(card.id, card.rank, card.suit, false)
    );
    const stock = new Pile('stock', 'STOCK', stockCards);

    // Waste empieza vacío
    const waste = new Pile('waste', 'WASTE', []);

    return new GameState(
      gameId,
      tableauPiles,
      foundationPiles,
      stock,
      waste
    );
  }

  /**
   * Roba cartas del stock al waste
   * 
   * @param count - Número de cartas a robar (típicamente 1 o 3)
   */
  static drawFromStock(gameState: GameState, count: number = 1): void {
    if (gameState.status !== 'PLAYING') {
      throw new Error('El juego no está en estado PLAYING');
    }

    // Si el stock está vacío, intentar reciclar
    if (gameState.stock.isEmpty()) {
      if (gameState.canRecycleStock()) {
        gameState.recycleStock();
      } else {
        throw new Error('El stock está vacío y no se puede reciclar');
      }
    }

    // Robar hasta 'count' cartas
    const cardsToDraw = Math.min(count, gameState.stock.cards.length);
    
    for (let i = 0; i < cardsToDraw; i++) {
      const card = gameState.stock.removeTopCard();
      if (card) {
        // Voltear la carta boca arriba y agregarla al waste
        const faceUpCard = card.faceUp ? card : card.flip();
        gameState.waste.addCard(faceUpCard);
      }
    }
  }

  /**
   * Mueve carta(s) de una pila a otra
   * 
   * @param fromPileId - ID de la pila origen
   * @param toPileId - ID de la pila destino
   * @param cardCount - Número de cartas a mover (para secuencias en tableau)
   */
  static moveCards(
    gameState: GameState, 
    fromPileId: string, 
    toPileId: string, 
    cardCount: number = 1
  ): void {
    if (gameState.status !== 'PLAYING') {
      throw new Error('El juego no está en estado PLAYING');
    }

    const fromPile = gameState.getPileById(fromPileId);
    const toPile = gameState.getPileById(toPileId);

    if (!fromPile || !toPile) {
      throw new Error('Pila de origen o destino no encontrada');
    }

    // Validaciones específicas según el tipo de movimiento
    if (fromPile.isEmpty()) {
      throw new Error('La pila de origen está vacía');
    }

    // No se puede mover desde stock (usar drawFromStock en su lugar)
    if (fromPile.type === 'STOCK') {
      throw new Error('No se puede mover directamente desde el stock. Usa drawFromStock');
    }

    // Validar que se puedan mover las cartas
    if (cardCount > fromPile.cards.length) {
      throw new Error('No hay suficientes cartas en la pila de origen');
    }

    // Para tableau, validar que sea una secuencia válida
    if (fromPile.type === 'TABLEAU' && cardCount > 1) {
      const startIndex = fromPile.cards.length - cardCount;
      if (!fromPile.canMoveSequence(startIndex)) {
        throw new Error('La secuencia de cartas no es válida para mover');
      }
    }

    // Obtener las cartas a mover
    const cardsToMove = cardCount === 1 
      ? [fromPile.topCard!] 
      : fromPile.cards.slice(fromPile.cards.length - cardCount);

    // Validar que la primera carta pueda ser aceptada por la pila destino
    if (!toPile.canAcceptCard(cardsToMove[0])) {
      throw new Error('La carta no puede ser colocada en la pila de destino');
    }

    // Realizar el movimiento
    fromPile.removeCards(cardCount);
    toPile.addCards(cardsToMove);

    // Si la pila de origen es tableau y quedó con cartas boca abajo, voltear la superior
    if (fromPile.type === 'TABLEAU' && !fromPile.isEmpty()) {
      fromPile.flipTopCard();
    }

    // Registrar el movimiento
    gameState.recordMove(fromPileId, toPileId, cardCount);

    // Actualizar puntaje (sistema simple)
    if (toPile.type === 'FOUNDATION') {
      gameState.addScore(10); // +10 por mover a foundation
    } else if (fromPile.type === 'WASTE' && toPile.type === 'TABLEAU') {
      gameState.addScore(5); // +5 por mover de waste a tableau
    }

    // Verificar condición de victoria
    gameState.checkWinCondition();
  }

  /**
   * Intenta mover automáticamente cartas elegibles a las foundations
   * Útil para completar el juego rápidamente cuando ya está casi ganado
   */
  static autoCompleteToFoundations(gameState: GameState): number {
    let movedCount = 0;
    let foundMove = true;

    // Continuar mientras se encuentren movimientos válidos
    while (foundMove) {
      foundMove = false;

      // Intentar desde el waste
      if (!gameState.waste.isEmpty()) {
        const wasteTop = gameState.waste.topCard!;
        for (const foundation of gameState.foundationPiles) {
          if (foundation.canAcceptCard(wasteTop)) {
            this.moveCards(gameState, 'waste', foundation.id, 1);
            movedCount++;
            foundMove = true;
            break;
          }
        }
      }

      // Intentar desde cada pila del tableau
      if (!foundMove) {
        for (const tableau of gameState.tableauPiles) {
          if (tableau.isEmpty()) continue;
          
          const tableauTop = tableau.topCard!;
          if (!tableauTop.faceUp) continue;

          for (const foundation of gameState.foundationPiles) {
            if (foundation.canAcceptCard(tableauTop)) {
              this.moveCards(gameState, tableau.id, foundation.id, 1);
              movedCount++;
              foundMove = true;
              break;
            }
          }

          if (foundMove) break;
        }
      }
    }

    return movedCount;
  }

  /**
   * Valida que un movimiento sea legal antes de ejecutarlo
   */
  static validateMove(
    gameState: GameState,
    fromPileId: string,
    toPileId: string,
    cardCount: number = 1
  ): { valid: boolean; reason?: string } {
    try {
      const fromPile = gameState.getPileById(fromPileId);
      const toPile = gameState.getPileById(toPileId);

      if (!fromPile || !toPile) {
        return { valid: false, reason: 'Pila no encontrada' };
      }

      if (fromPile.isEmpty()) {
        return { valid: false, reason: 'La pila de origen está vacía' };
      }

      if (fromPile.type === 'STOCK') {
        return { valid: false, reason: 'No se puede mover desde el stock directamente' };
      }

      if (cardCount > fromPile.cards.length) {
        return { valid: false, reason: 'No hay suficientes cartas' };
      }

      const cardsToMove = cardCount === 1 
        ? [fromPile.topCard!] 
        : fromPile.cards.slice(fromPile.cards.length - cardCount);

      if (!toPile.canAcceptCard(cardsToMove[0])) {
        return { valid: false, reason: 'Movimiento no permitido por las reglas' };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, reason: (error as Error).message };
    }
  }
}
