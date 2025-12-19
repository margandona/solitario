/**
 * Firebase Functions Entry Point
 * Wrapper para el backend existente adaptado a Firebase Functions
 */

import * as admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';

// Importar desde el backend (copiamos la estructura)
import { FirebaseGameRepository } from './infrastructure/repositories/FirebaseGameRepository';
import { GameController } from './infrastructure/http/GameController';
import { createGameRoutes } from './infrastructure/http/routes';

// Casos de uso
import { StartNewGameUseCase } from './application/usecases/StartNewGameUseCase';
import { GetGameStateUseCase } from './application/usecases/GetGameStateUseCase';
import { DrawFromStockUseCase } from './application/usecases/DrawFromStockUseCase';
import { MoveCardsUseCase } from './application/usecases/MoveCardsUseCase';
import { AutoCompleteFoundationsUseCase } from './application/usecases/AutoCompleteFoundationsUseCase';

// Inicializar Firebase Admin (solo si no está inicializado)
if (!admin.apps.length) {
  admin.initializeApp();
}

// Crear aplicación Express
const app = express();

// Middlewares
app.use(cors({ origin: true })); // En Functions, usar cors con origin: true
app.use(express.json());

// Importar versión
import { getFullVersionInfo } from './version';

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Solitario API - Firebase Functions',
    firebase: '✅ Connected',
    ...getFullVersionInfo()
  });
});

// Configurar dependencias e inyección
const gameRepository = new FirebaseGameRepository();

// Deck provider local (genera cartas sin API externa)
import { Card, Rank, Suit } from './domain/entities/Card';
const localDeckProvider = {
  async getShuffledDeck(): Promise<Card[]> {
    // Generar todas las cartas
    const suits: Suit[] = ['HEARTS', 'DIAMONDS', 'CLUBS', 'SPADES'];
    const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    
    const cards: Card[] = [];
    let cardId = 1;
    for (const suit of suits) {
      for (const rank of ranks) {
        cards.push(new Card(`card-${cardId++}`, rank as Rank, suit as Suit, false));
      }
    }
    
    // Shuffle Fisher-Yates
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    
    return cards;
  }
};

// Casos de uso
const startNewGameUseCase = new StartNewGameUseCase(localDeckProvider, gameRepository);
const getGameStateUseCase = new GetGameStateUseCase(gameRepository);
const drawFromStockUseCase = new DrawFromStockUseCase(gameRepository);
const moveCardsUseCase = new MoveCardsUseCase(gameRepository);
const autoCompleteFoundationsUseCase = new AutoCompleteFoundationsUseCase(gameRepository);

// Controlador
const gameController = new GameController(
  startNewGameUseCase,
  getGameStateUseCase,
  drawFromStockUseCase,
  moveCardsUseCase,
  autoCompleteFoundationsUseCase
);

// Rutas
const gameRoutes = createGameRoutes(gameController);
app.use('/', gameRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path
  });
});

// Exportar como Firebase Function (v2)
// La ruta será: https://us-central1-<project-id>.cloudfunctions.net/api
import {onRequest} from 'firebase-functions/v2/https';
export const api = onRequest({
  region: 'us-central1',
  maxInstances: 10,
  timeoutSeconds: 60,
  memory: '256MiB'
}, app);
