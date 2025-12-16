/**
 * CAPA DE INFRAESTRUCTURA - Controladores HTTP
 * 
 * Exponen los casos de uso a través de endpoints REST.
 * Siguiendo el principio de Inversión de Dependencias.
 */

import { Request, Response } from 'express';
import { StartNewGameUseCase } from '../../application/usecases/StartNewGameUseCase';
import { GetGameStateUseCase } from '../../application/usecases/GetGameStateUseCase';
import { DrawFromStockUseCase } from '../../application/usecases/DrawFromStockUseCase';
import { MoveCardsUseCase } from '../../application/usecases/MoveCardsUseCase';
import { AutoCompleteFoundationsUseCase } from '../../application/usecases/AutoCompleteFoundationsUseCase';

export class GameController {
  constructor(
    private readonly startNewGameUseCase: StartNewGameUseCase,
    private readonly getGameStateUseCase: GetGameStateUseCase,
    private readonly drawFromStockUseCase: DrawFromStockUseCase,
    private readonly moveCardsUseCase: MoveCardsUseCase,
    private readonly autoCompleteFoundationsUseCase: AutoCompleteFoundationsUseCase
  ) {}

  /**
   * POST /api/game
   * Inicia una nueva partida
   */
  async startNewGame(req: Request, res: Response): Promise<void> {
    try {
      const gameState = await this.startNewGameUseCase.execute();
      
      res.status(201).json({
        success: true,
        data: gameState.toJSON()
      });
    } catch (error) {
      console.error('Error al iniciar nuevo juego:', error);
      res.status(500).json({
        success: false,
        error: 'Error al iniciar el juego',
        message: (error as Error).message
      });
    }
  }

  /**
   * GET /api/game/:id
   * Obtiene el estado de una partida
   */
  async getGameState(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const gameState = await this.getGameStateUseCase.execute(id);
      
      res.status(200).json({
        success: true,
        data: gameState.toJSON()
      });
    } catch (error) {
      const errorMessage = (error as Error).message;
      const statusCode = errorMessage.includes('no encontrado') ? 404 : 500;
      
      res.status(statusCode).json({
        success: false,
        error: 'Error al obtener el estado del juego',
        message: errorMessage
      });
    }
  }

  /**
   * POST /api/game/:id/draw
   * Roba cartas del stock
   */
  async drawFromStock(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { count = 1 } = req.body;
      
      const gameState = await this.drawFromStockUseCase.execute(id, count);
      
      res.status(200).json({
        success: true,
        data: gameState.toJSON()
      });
    } catch (error) {
      const errorMessage = (error as Error).message;
      const statusCode = errorMessage.includes('no encontrado') ? 404 : 400;
      
      res.status(statusCode).json({
        success: false,
        error: 'Error al robar cartas',
        message: errorMessage
      });
    }
  }

  /**
   * POST /api/game/:id/move
   * Mueve carta(s) de una pila a otra
   */
  async moveCards(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { fromPileId, toPileId, cardCount = 1 } = req.body;

      console.log(`🎯 Intentando mover: ${cardCount} carta(s) de ${fromPileId} a ${toPileId} en juego ${id}`);

      if (!fromPileId || !toPileId) {
        res.status(400).json({
          success: false,
          error: 'Faltan parámetros requeridos',
          message: 'Se requieren fromPileId y toPileId'
        });
        return;
      }

      const gameState = await this.moveCardsUseCase.execute({
        gameId: id,
        fromPileId,
        toPileId,
        cardCount
      });
      
      res.status(200).json({
        success: true,
        data: gameState.toJSON()
      });
    } catch (error) {
      const errorMessage = (error as Error).message;
      const statusCode = errorMessage.includes('no encontrado') ? 404 : 400;
      
      console.error(`❌ Error al mover cartas: ${errorMessage}`, {
        gameId: req.params.id,
        fromPileId: req.body.fromPileId,
        toPileId: req.body.toPileId,
        cardCount: req.body.cardCount
      });
      
      res.status(statusCode).json({
        success: false,
        error: 'Error al mover cartas',
        message: errorMessage
      });
    }
  }

  /**
   * POST /api/game/:id/foundation-auto
   * Auto-completa movimientos a las foundations
   */
  async autoCompleteFoundations(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const result = await this.autoCompleteFoundationsUseCase.execute(id);
      
      res.status(200).json({
        success: true,
        data: result.gameState.toJSON(),
        movedCount: result.movedCount
      });
    } catch (error) {
      const errorMessage = (error as Error).message;
      const statusCode = errorMessage.includes('no encontrado') ? 404 : 400;
      
      res.status(statusCode).json({
        success: false,
        error: 'Error al auto-completar',
        message: errorMessage
      });
    }
  }

  /**
   * POST /api/game/:id/validate-move
   * Valida si un movimiento es legal sin ejecutarlo
   */
  async validateMove(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { fromPileId, toPileId, cardCount = 1 } = req.body;

      if (!fromPileId || !toPileId) {
        res.status(400).json({
          success: false,
          error: 'Faltan parámetros requeridos'
        });
        return;
      }

      const validation = await this.moveCardsUseCase.validate({
        gameId: id,
        fromPileId,
        toPileId,
        cardCount
      });
      
      res.status(200).json({
        success: true,
        data: validation
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error al validar movimiento',
        message: (error as Error).message
      });
    }
  }
}
