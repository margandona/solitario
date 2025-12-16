/**
 * CAPA DE INFRAESTRUCTURA - Repositorio en Memoria
 * 
 * Implementación del GameRepository que almacena estados en memoria.
 * En producción, esto podría reemplazarse por una implementación con base de datos.
 */

import { GameRepository } from '../../domain/interfaces';
import { GameState } from '../../domain/entities/GameState';

export class InMemoryGameRepository implements GameRepository {
  private games: Map<string, any> = new Map();

  async save(gameState: GameState): Promise<void> {
    this.games.set(gameState.id, gameState.toJSON());
  }

  async findById(gameId: string): Promise<any | null> {
    return this.games.get(gameId) || null;
  }

  async delete(gameId: string): Promise<void> {
    this.games.delete(gameId);
  }

  async findAll(): Promise<any[]> {
    return Array.from(this.games.values());
  }

  /**
   * Método adicional para limpiar juegos antiguos (útil para testing)
   */
  clear(): void {
    this.games.clear();
  }

  /**
   * Obtiene el número de juegos almacenados
   */
  count(): number {
    return this.games.size;
  }
}
