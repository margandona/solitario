/**
 * CAPA DE APLICACIÓN - Caso de Uso: Auto-completar a Foundations
 * 
 * Mueve automáticamente cartas elegibles a las pilas de fundación.
 */

import { GameRepository } from '../../domain/interfaces';
import { GameState } from '../../domain/entities/GameState';
import { GameService } from '../../domain/services/GameService';

export class AutoCompleteFoundationsUseCase {
  constructor(
    private readonly gameRepository: GameRepository
  ) {}

  async execute(gameId: string): Promise<{ gameState: GameState; movedCount: number }> {
    // Obtener el estado actual del juego
    const gameStateData = await this.gameRepository.findById(gameId);
    
    if (!gameStateData) {
      throw new Error(`Juego con ID ${gameId} no encontrado`);
    }

    const gameState = GameState.fromJSON(gameStateData);

    // Ejecutar auto-completado
    const movedCount = GameService.autoCompleteToFoundations(gameState);

    // Guardar el estado actualizado
    await this.gameRepository.save(gameState);

    return { gameState, movedCount };
  }
}
