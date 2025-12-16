/**
 * CAPA DE INFRAESTRUCTURA - Rutas HTTP
 * 
 * Define las rutas de la API REST para el juego.
 */

import { Router } from 'express';
import { GameController } from './GameController';

export function createGameRoutes(gameController: GameController): Router {
  const router = Router();

  // Iniciar nueva partida
  router.post('/game', (req, res) => gameController.startNewGame(req, res));

  // Obtener estado de partida
  router.get('/game/:id', (req, res) => gameController.getGameState(req, res));

  // Robar cartas del stock
  router.post('/game/:id/draw', (req, res) => gameController.drawFromStock(req, res));

  // Mover cartas
  router.post('/game/:id/move', (req, res) => gameController.moveCards(req, res));

  // Auto-completar a foundations
  router.post('/game/:id/foundation-auto', (req, res) => 
    gameController.autoCompleteFoundations(req, res)
  );

  // Validar movimiento
  router.post('/game/:id/validate-move', (req, res) => 
    gameController.validateMove(req, res)
  );

  return router;
}
