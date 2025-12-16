/**
 * CAPA DE DOMINIO - Entidad Card
 * 
 * Representa una carta individual del juego.
 * Esta entidad es pura y no depende de ningún framework.
 */

export type Suit = 'HEARTS' | 'DIAMONDS' | 'CLUBS' | 'SPADES';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
export type Color = 'RED' | 'BLACK';

export interface CardData {
  id: string;
  rank: Rank;
  suit: Suit;
  faceUp: boolean;
}

export class Card {
  constructor(
    public readonly id: string,
    public readonly rank: Rank,
    public readonly suit: Suit,
    public faceUp: boolean
  ) {}

  /**
   * Determina el color de la carta según su palo
   */
  get color(): Color {
    return this.suit === 'HEARTS' || this.suit === 'DIAMONDS' ? 'RED' : 'BLACK';
  }

  /**
   * Obtiene el valor numérico de la carta (A=1, J=11, Q=12, K=13)
   */
  get value(): number {
    const rankValues: Record<Rank, number> = {
      'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
      '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13
    };
    return rankValues[this.rank];
  }

  /**
   * Voltea la carta (cambia faceUp)
   */
  flip(): Card {
    return new Card(this.id, this.rank, this.suit, !this.faceUp);
  }

  /**
   * Verifica si esta carta puede apilarse sobre otra en el tableau
   * Regla: descendente y alternando colores
   */
  canStackOnTableau(target: Card): boolean {
    return (
      this.value === target.value - 1 &&
      this.color !== target.color
    );
  }

  /**
   * Verifica si esta carta puede colocarse en una foundation
   * Regla: mismo palo y valor siguiente (o As en foundation vacía)
   */
  canPlaceOnFoundation(topCard: Card | null): boolean {
    if (topCard === null) {
      return this.rank === 'A';
    }
    return (
      this.suit === topCard.suit &&
      this.value === topCard.value + 1
    );
  }

  /**
   * Convierte la carta a un objeto plano para serialización
   */
  toJSON(): CardData {
    return {
      id: this.id,
      rank: this.rank,
      suit: this.suit,
      faceUp: this.faceUp
    };
  }

  /**
   * Crea una carta desde un objeto plano
   */
  static fromJSON(data: CardData): Card {
    return new Card(data.id, data.rank, data.suit, data.faceUp);
  }
}
