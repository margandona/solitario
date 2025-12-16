/**
 * CAPA DE DOMINIO - Entidad GameState
 * 
 * Representa el estado completo de una partida de Solitario.
 * Mantiene todas las pilas y el estado del juego.
 */

import { Pile, PileType } from './Pile';
import { Card } from './Card';

export type GameStatus = 'PLAYING' | 'WON' | 'LOST';

export interface Move {
  from: string; // ID de la pila origen
  to: string; // ID de la pila destino
  cardCount: number;
  timestamp: Date;
}

export interface GameStateData {
  id: string;
  tableauPiles: Pile[];
  foundationPiles: Pile[];
  stock: Pile;
  waste: Pile;
  status: GameStatus;
  moves: Move[];
  score: number;
  startTime: Date;
  endTime?: Date;
}

export class GameState {
  constructor(
    public readonly id: string,
    public tableauPiles: Pile[], // 7 pilas de la mesa
    public foundationPiles: Pile[], // 4 pilas de fundación (una por palo)
    public stock: Pile, // Mazo de robo
    public waste: Pile, // Pila de descarte
    public status: GameStatus = 'PLAYING',
    public moves: Move[] = [],
    public score: number = 0,
    public readonly startTime: Date = new Date(),
    public endTime?: Date
  ) {
    if (tableauPiles.length !== 7) {
      throw new Error('Debe haber exactamente 7 pilas de tableau');
    }
    if (foundationPiles.length !== 4) {
      throw new Error('Debe haber exactamente 4 pilas de foundation');
    }
  }

  /**
   * Obtiene una pila por su ID
   */
  getPileById(pileId: string): Pile | null {
    const allPiles = [
      ...this.tableauPiles,
      ...this.foundationPiles,
      this.stock,
      this.waste
    ];
    return allPiles.find(pile => pile.id === pileId) || null;
  }

  /**
   * Registra un movimiento en el historial
   */
  recordMove(from: string, to: string, cardCount: number): void {
    this.moves.push({
      from,
      to,
      cardCount,
      timestamp: new Date()
    });
  }

  /**
   * Incrementa el puntaje
   */
  addScore(points: number): void {
    this.score += points;
    if (this.score < 0) this.score = 0;
  }

  /**
   * Verifica si el juego ha sido ganado
   * Victoria: todas las foundations están completas
   */
  checkWinCondition(): boolean {
    const allFoundationsComplete = this.foundationPiles.every(pile => 
      pile.isFoundationComplete()
    );

    if (allFoundationsComplete && this.status === 'PLAYING') {
      this.status = 'WON';
      this.endTime = new Date();
      return true;
    }

    return false;
  }

  /**
   * Verifica si el juego está perdido
   * Derrota: no hay movimientos posibles y el stock está vacío y no se puede reciclar
   * (Esta es una implementación simplificada)
   */
  checkLoseCondition(): boolean {
    // Si el stock no está vacío o el waste tiene cartas que se pueden usar, no está perdido
    if (!this.stock.isEmpty() || !this.waste.isEmpty()) {
      return false;
    }

    // Verificar si hay algún movimiento posible en el tableau
    const hasTableauMoves = this.hasAvailableTableauMoves();
    
    if (!hasTableauMoves && this.status === 'PLAYING') {
      this.status = 'LOST';
      this.endTime = new Date();
      return true;
    }

    return false;
  }

  /**
   * Verifica si hay movimientos disponibles en el tableau
   */
  private hasAvailableTableauMoves(): boolean {
    // Verificar movimientos entre pilas del tableau
    for (const sourcePile of this.tableauPiles) {
      if (sourcePile.isEmpty()) continue;
      
      const visibleCards = sourcePile.visibleCards;
      if (visibleCards.length === 0) continue;

      // Intentar cada carta visible
      for (let i = 0; i < visibleCards.length; i++) {
        const card = visibleCards[i];
        
        // Intentar mover a otra pila del tableau
        for (const targetPile of this.tableauPiles) {
          if (targetPile.id === sourcePile.id) continue;
          if (targetPile.canAcceptCard(card)) return true;
        }

        // Intentar mover a foundation
        for (const foundationPile of this.foundationPiles) {
          if (foundationPile.canAcceptCard(card)) return true;
        }
      }
    }

    return false;
  }

  /**
   * Obtiene el tiempo transcurrido de juego en segundos
   */
  getElapsedTime(): number {
    const endTime = this.endTime || new Date();
    return Math.floor((endTime.getTime() - this.startTime.getTime()) / 1000);
  }

  /**
   * Verifica si el stock se puede reciclar (pasar waste de vuelta a stock)
   */
  canRecycleStock(): boolean {
    return this.stock.isEmpty() && !this.waste.isEmpty();
  }

  /**
   * Recicla el stock: pasa todas las cartas del waste al stock boca abajo
   */
  recycleStock(): void {
    if (!this.canRecycleStock()) {
      throw new Error('No se puede reciclar el stock');
    }

    // Tomar todas las cartas del waste
    const wasteCards = this.waste.removeCards(this.waste.cards.length);
    
    // Voltearlas boca abajo y agregarlas al stock en orden inverso
    const recycledCards = wasteCards.reverse().map(card => 
      card.faceUp ? card.flip() : card
    );
    
    this.stock.addCards(recycledCards);
  }

  /**
   * Convierte el estado a un objeto plano para serialización
   */
  toJSON(): any {
    const data: any = {
      id: this.id,
      tableauPiles: this.tableauPiles.map(p => p.toJSON()),
      foundationPiles: this.foundationPiles.map(p => p.toJSON()),
      stock: this.stock.toJSON(),
      waste: this.waste.toJSON(),
      status: this.status,
      moves: this.moves,
      score: this.score,
      startTime: this.startTime.toISOString()
    };
    
    // Solo incluir endTime si tiene valor
    if (this.endTime !== undefined) {
      data.endTime = this.endTime.toISOString();
    }
    
    return data;
  }

  /**
   * Crea un estado de juego desde un objeto plano
   */
  static fromJSON(data: any): GameState {
    return new GameState(
      data.id,
      data.tableauPiles.map((p: any) => Pile.fromJSON(p)),
      data.foundationPiles.map((p: any) => Pile.fromJSON(p)),
      Pile.fromJSON(data.stock),
      Pile.fromJSON(data.waste),
      data.status,
      data.moves,
      data.score,
      new Date(data.startTime),
      data.endTime ? new Date(data.endTime) : undefined
    );
  }
}
