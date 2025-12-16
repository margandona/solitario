/**
 * CAPA DE APLICACIÓN - Caso de Uso: Robar del Mazo
 * 
 * Permite robar cartas del stock al waste.
 */

import { GameRepository } from '../../domain/interfaces';
import { GameState } from '../../domain/entities/GameState';
import { GameService } from '../../domain/services/GameService';

export class DrawFromStockUseCase {
  constructor(
    private readonly gameRepository: GameRepository
  ) {}

  async execute(gameId: string, count: number = 1): Promise<GameState> {
    // Obtener el estado actual del juego
    const gameStateData = await this.gameRepository.findById(gameId);
    
    if (!gameStateData) {
      throw new Error(`Juego con ID ${gameId} no encontrado`);
    }

    const gameState = GameState.fromJSON(gameStateData);

    // Ejecutar la acción de robar usando el servicio de dominio
    GameService.drawFromStock(gameState, count);

    // Guardar el estado actualizado
    await this.gameRepository.save(gameState);

    return gameState;
  }
}
