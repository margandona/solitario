/**
 * CAPA DE DOMINIO - Entidad Pile
 * 
 * Representa una pila de cartas en el juego.
 * Puede ser: TABLEAU (mesa), FOUNDATION (base), STOCK (mazo), WASTE (descarte)
 */

import { Card } from './Card';

export type PileType = 'TABLEAU' | 'FOUNDATION' | 'STOCK' | 'WASTE';

export interface PileData {
  id: string;
  type: PileType;
  cards: Card[];
  foundationSuit?: string; // Solo para FOUNDATION
}

export class Pile {
  constructor(
    public readonly id: string,
    public readonly type: PileType,
    public cards: Card[],
    public readonly foundationSuit?: string // Para identificar qué palo va en cada foundation
  ) {}

  /**
   * Obtiene la carta superior de la pila
   */
  get topCard(): Card | null {
    return this.cards.length > 0 ? this.cards[this.cards.length - 1] : null;
  }

  /**
   * Obtiene todas las cartas visibles (boca arriba) desde la primera visible hasta el final
   */
  get visibleCards(): Card[] {
    const firstFaceUpIndex = this.cards.findIndex(card => card.faceUp);
    if (firstFaceUpIndex === -1) return [];
    return this.cards.slice(firstFaceUpIndex);
  }

  /**
   * Verifica si la pila está vacía
   */
  isEmpty(): boolean {
    return this.cards.length === 0;
  }

  /**
   * Añade una carta a la pila
   */
  addCard(card: Card): void {
    this.cards.push(card);
  }

  /**
   * Añade múltiples cartas a la pila
   */
  addCards(cards: Card[]): void {
    this.cards.push(...cards);
  }

  /**
   * Remueve la carta superior
   */
  removeTopCard(): Card | null {
    return this.cards.pop() || null;
  }

  /**
   * Remueve N cartas desde arriba
   */
  removeCards(count: number): Card[] {
    if (count > this.cards.length) {
      throw new Error('No hay suficientes cartas en la pila');
    }
    return this.cards.splice(this.cards.length - count, count);
  }

  /**
   * Voltea la carta superior si está boca abajo
   */
  flipTopCard(): void {
    const top = this.topCard;
    if (top && !top.faceUp) {
      this.cards[this.cards.length - 1] = top.flip();
    }
  }

  /**
   * Verifica si se puede colocar una carta en esta pila según las reglas
   */
  canAcceptCard(card: Card): boolean {
    switch (this.type) {
      case 'TABLEAU':
        // Si está vacía, solo acepta Rey
        if (this.isEmpty()) {
          return card.rank === 'K';
        }
        // Si no, debe seguir la regla de apilamiento
        const top = this.topCard!;
        return top.faceUp && card.canStackOnTableau(top);

      case 'FOUNDATION':
        // Verificar que sea el palo correcto
        if (this.foundationSuit && card.suit !== this.foundationSuit && !this.isEmpty()) {
          return false;
        }
        return card.canPlaceOnFoundation(this.topCard);

      case 'WASTE':
      case 'STOCK':
        // Estas pilas tienen reglas especiales manejadas por el servicio
        return true;

      default:
        return false;
    }
  }

  /**
   * Verifica si una secuencia de cartas puede ser movida desde esta pila
   */
  canMoveSequence(startIndex: number): boolean {
    if (this.type !== 'TABLEAU') return false;
    if (startIndex < 0 || startIndex >= this.cards.length) return false;

    // Solo se pueden mover cartas visibles
    const cardsToMove = this.cards.slice(startIndex);
    if (!cardsToMove[0].faceUp) return false;

    // Verificar que la secuencia sea válida (descendente y alternando colores)
    for (let i = 1; i < cardsToMove.length; i++) {
      if (!cardsToMove[i].canStackOnTableau(cardsToMove[i - 1])) {
        return false;
      }
    }

    return true;
  }

  /**
   * Verifica si la foundation está completa (13 cartas: A→K)
   */
  isFoundationComplete(): boolean {
    return this.type === 'FOUNDATION' && this.cards.length === 13;
  }

  /**
   * Convierte la pila a un objeto plano para serialización
   */
  toJSON(): PileData {
    const data: any = {
      id: this.id,
      type: this.type,
      cards: this.cards.map(c => c.toJSON())
    };
    
    // Solo incluir foundationSuit si tiene valor
    if (this.foundationSuit !== undefined) {
      data.foundationSuit = this.foundationSuit;
    }
    
    return data;
  }

  /**
   * Crea una pila desde un objeto plano
   */
  static fromJSON(data: PileData): Pile {
    const cards = data.cards.map(cardData => Card.fromJSON(cardData));
    return new Pile(data.id, data.type, cards, data.foundationSuit);
  }
}
