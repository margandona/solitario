/**
 * CAPA DE APLICACIÓN - Caso de Uso: Iniciar Nueva Partida
 * 
 * Orquesta la creación de un nuevo juego usando el servicio de dominio
 * y el proveedor de mazos.
 * 
 * Principio SRP (Single Responsibility): Este caso de uso tiene una sola
 * responsabilidad: iniciar una nueva partida.
 */

import { v4 as uuidv4 } from 'uuid';
import { DeckProvider, GameRepository } from '../../domain/interfaces';
import { GameService } from '../../domain/services/GameService';
import { GameState } from '../../domain/entities/GameState';

export class StartNewGameUseCase {
  constructor(
    private readonly deckProvider: DeckProvider,
    private readonly gameRepository: GameRepository
  ) {}

  async execute(): Promise<GameState> {
    // Generar ID único para el juego
    const gameId = uuidv4();

    // Obtener un mazo barajado del proveedor
    const shuffledDeck = await this.deckProvider.getShuffledDeck();

    // Inicializar el estado del juego usando el servicio de dominio
    const gameState = GameService.initializeGame(gameId, shuffledDeck);

    // Persistir el estado inicial
    await this.gameRepository.save(gameState);

    return gameState;
  }
}
