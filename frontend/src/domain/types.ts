/**
 * FRONTEND - Tipos de Dominio
 * 
 * Tipos TypeScript que corresponden a las entidades del backend.
 */

export type Suit = 'HEARTS' | 'DIAMONDS' | 'CLUBS' | 'SPADES';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
export type Color = 'RED' | 'BLACK';
export type PileType = 'TABLEAU' | 'FOUNDATION' | 'STOCK' | 'WASTE';
export type GameStatus = 'PLAYING' | 'WON' | 'LOST';

export interface Card {
  id: string;
  rank: Rank;
  suit: Suit;
  faceUp: boolean;
}

export interface Pile {
  id: string;
  type: PileType;
  cards: Card[];
  foundationSuit?: Suit;
}

export interface Move {
  from: string;
  to: string;
  cardCount: number;
  timestamp: string;
}

export interface GameState {
  id: string;
  tableauPiles: Pile[];
  foundationPiles: Pile[];
  stock: Pile;
  waste: Pile;
  status: GameStatus;
  moves: Move[];
  score: number;
  startTime: string;
  endTime?: string;
}
