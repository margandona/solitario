/**
 * CAPA DE APLICACIÓN - Caso de Uso: Mover Cartas
 * 
 * Permite mover carta(s) de una pila a otra siguiendo las reglas del juego.
 */

import { GameRepository } from '../../domain/interfaces';
import { GameState } from '../../domain/entities/GameState';
import { GameService } from '../../domain/services/GameService';

export interface MoveCardsRequest {
  gameId: string;
  fromPileId: string;
  toPileId: string;
  cardCount?: number;
}

export class MoveCardsUseCase {
  constructor(
    private readonly gameRepository: GameRepository
  ) {}

  async execute(request: MoveCardsRequest): Promise<GameState> {
    const { gameId, fromPileId, toPileId, cardCount = 1 } = request;

    // Obtener el estado actual del juego
    const gameStateData = await this.gameRepository.findById(gameId);
    
    if (!gameStateData) {
      throw new Error(`Juego con ID ${gameId} no encontrado`);
    }

    const gameState = GameState.fromJSON(gameStateData);

    // Ejecutar el movimiento usando el servicio de dominio
    GameService.moveCards(gameState, fromPileId, toPileId, cardCount);

    // Guardar el estado actualizado
    await this.gameRepository.save(gameState);

    return gameState;
  }

  /**
   * Valida un movimiento sin ejecutarlo
   */
  async validate(request: MoveCardsRequest): Promise<{ valid: boolean; reason?: string }> {
    const { gameId, fromPileId, toPileId, cardCount = 1 } = request;

    const gameStateData = await this.gameRepository.findById(gameId);
    
    if (!gameStateData) {
      return { valid: false, reason: 'Juego no encontrado' };
    }

    const gameState = GameState.fromJSON(gameStateData);

    return GameService.validateMove(gameState, fromPileId, toPileId, cardCount);
  }
}
