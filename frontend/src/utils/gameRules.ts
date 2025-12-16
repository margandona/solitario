/**
 * Reglas de validación de movimientos del Solitario Klondike
 * Implementación frontend que replica la lógica del backend
 */

import type { Card, Pile } from '../domain/types';

/**
 * Obtiene el color de una carta (rojo o negro)
 */
function getCardColor(card: Card): 'red' | 'black' {
  return (card.suit === 'HEARTS' || card.suit === 'DIAMONDS') ? 'red' : 'black';
}

/**
 * Obtiene el valor numérico de un rango de carta
 */
function getRankValue(rank: string): number {
  const ranks: Record<string, number> = {
    'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
    '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13
  };
  return ranks[rank] || 0;
}

/**
 * Verifica si una carta puede apilarse sobre otra en el tableau
 * Regla: Descendente (carta inferior es 1 valor mayor) y colores alternados
 */
export function canStackOnTableau(cardToPlace: Card, cardBelow: Card): boolean {
  // Verificar que los colores sean diferentes
  if (getCardColor(cardToPlace) === getCardColor(cardBelow)) {
    return false;
  }

  // Verificar que el rango sea descendente (carta de abajo es 1 mayor)
  const valueToPlace = getRankValue(cardToPlace.rank);
  const valueBelow = getRankValue(cardBelow.rank);
  
  return valueBelow === valueToPlace + 1;
}

/**
 * Verifica si una carta puede colocarse en una foundation
 * Regla: Mismo palo, ascendente desde As
 */
export function canPlaceOnFoundation(cardToPlace: Card, foundationTopCard: Card | null, foundationSuit?: string): boolean {
  // Si la foundation está vacía, solo acepta As
  if (!foundationTopCard) {
    return cardToPlace.rank === 'A';
  }

  // Debe ser del mismo palo
  if (cardToPlace.suit !== foundationTopCard.suit) {
    return false;
  }

  // Verificar que el foundationSuit coincida si está definido
  if (foundationSuit && cardToPlace.suit !== foundationSuit) {
    return false;
  }

  // Debe ser ascendente (carta de arriba es 1 mayor)
  const valueToPlace = getRankValue(cardToPlace.rank);
  const valueTop = getRankValue(foundationTopCard.rank);
  
  return valueToPlace === valueTop + 1;
}

/**
 * Verifica si una carta puede colocarse en una pila específica
 */
export function canPlaceCardOnPile(cardToPlace: Card, targetPile: Pile): boolean {
  const topCard = targetPile.cards.length > 0 
    ? targetPile.cards[targetPile.cards.length - 1] 
    : null;

  switch (targetPile.type) {
    case 'TABLEAU':
      // Si está vacía, solo acepta Rey
      if (!topCard) {
        return cardToPlace.rank === 'K';
      }
      // Si no, debe seguir la regla de apilamiento
      return topCard.faceUp && canStackOnTableau(cardToPlace, topCard);

    case 'FOUNDATION':
      // Verificar que sea el palo correcto si está definido
      if (targetPile.foundationSuit && topCard && cardToPlace.suit !== targetPile.foundationSuit) {
        return false;
      }
      return canPlaceOnFoundation(cardToPlace, topCard, targetPile.foundationSuit);

    case 'WASTE':
    case 'STOCK':
      // No se puede mover a estas pilas
      return false;

    default:
      return false;
  }
}

/**
 * Verifica si una secuencia de cartas es válida para mover
 * (todas deben estar boca arriba y seguir la regla de apilamiento)
 */
export function isValidCardSequence(cards: Card[]): boolean {
  if (cards.length === 0) return false;
  
  // Todas deben estar boca arriba
  if (!cards.every(card => card.faceUp)) return false;
  
  // Si solo es una carta, es válida
  if (cards.length === 1) return true;
  
  // Verificar que cada carta pueda apilarse sobre la anterior
  for (let i = 1; i < cards.length; i++) {
    if (!canStackOnTableau(cards[i], cards[i - 1])) {
      return false;
    }
  }
  
  return true;
}

/**
 * Verifica si se puede mover una secuencia de cartas a una pila
 */
export function canMoveCardsToPile(cardsToMove: Card[], targetPile: Pile): boolean {
  if (cardsToMove.length === 0) return false;
  
  // Verificar que la secuencia sea válida
  if (!isValidCardSequence(cardsToMove)) return false;
  
  // Verificar que la primera carta se pueda colocar en la pila destino
  return canPlaceCardOnPile(cardsToMove[0], targetPile);
}
