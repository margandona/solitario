/**
 * CAPA DE APLICACIÓN - Caso de Uso: Obtener Estado del Juego
 * 
 * Recupera el estado actual de una partida.
 */

import { GameRepository } from '../../domain/interfaces';
import { GameState } from '../../domain/entities/GameState';

export class GetGameStateUseCase {
  constructor(
    private readonly gameRepository: GameRepository
  ) {}

  async execute(gameId: string): Promise<GameState> {
    const gameStateData = await this.gameRepository.findById(gameId);
    
    if (!gameStateData) {
      throw new Error(`Juego con ID ${gameId} no encontrado`);
    }

    return GameState.fromJSON(gameStateData);
  }
}
