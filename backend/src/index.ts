/**
 * PUNTO DE ENTRADA - Backend del Solitario
 * 
 * Aquí se ensamblan todas las capas siguiendo Clean Architecture:
 * - Se crean las instancias de infraestructura (repositorios, servicios externos)
 * - Se inyectan en los casos de uso
 * - Se pasan al controlador HTTP
 * - Se configura Express
 * 
 * Este es el único lugar donde se conoce toda la arquitectura.
 */

import express, { Application } from 'express';
import cors from 'cors';
import * as admin from 'firebase-admin';
import { config } from './config';

// Infraestructura
import { DeckOfCardsApiService } from './infrastructure/api/DeckOfCardsApiService';
import { FirebaseGameRepository } from './infrastructure/repositories/FirebaseGameRepository';
import { GameController } from './infrastructure/http/GameController';
import { createGameRoutes } from './infrastructure/http/routes';

// Casos de uso
import { StartNewGameUseCase } from './application/usecases/StartNewGameUseCase';
import { GetGameStateUseCase } from './application/usecases/GetGameStateUseCase';
import { DrawFromStockUseCase } from './application/usecases/DrawFromStockUseCase';
import { MoveCardsUseCase } from './application/usecases/MoveCardsUseCase';
import { AutoCompleteFoundationsUseCase } from './application/usecases/AutoCompleteFoundationsUseCase';

/**
 * Inicializa Firebase Admin SDK
 */
function initializeFirebase() {
  try {
    // Verificar si ya está inicializado
    if (admin.apps.length === 0) {
      const serviceAccount = require(config.firebase.credentialsPath);
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });

      console.log('✅ Firebase Admin SDK inicializado correctamente');
      console.log(`📊 Usando colección: ${config.firebase.collectionName}`);
    }
  } catch (error) {
    console.error('❌ Error al inicializar Firebase:', error);
    throw new Error('No se pudo conectar a Firebase. Verifica las credenciales.');
  }
}

/**
 * Inyección de dependencias manual (Dependency Injection)
 * En una aplicación más grande, se podría usar un contenedor IoC
 */
function setupDependencies() {
  // Crear instancias de infraestructura
  const deckProvider = new DeckOfCardsApiService(config.deckApiUrl);
  const gameRepository = new FirebaseGameRepository();

  // Crear casos de uso con sus dependencias
  const startNewGameUseCase = new StartNewGameUseCase(deckProvider, gameRepository);
  const getGameStateUseCase = new GetGameStateUseCase(gameRepository);
  const drawFromStockUseCase = new DrawFromStockUseCase(gameRepository);
  const moveCardsUseCase = new MoveCardsUseCase(gameRepository);
  const autoCompleteFoundationsUseCase = new AutoCompleteFoundationsUseCase(gameRepository);

  // Crear controlador con todos los casos de uso
  const gameController = new GameController(
    startNewGameUseCase,
    getGameStateUseCase,
    drawFromStockUseCase,
    moveCardsUseCase,
    autoCompleteFoundationsUseCase
  );

  return { gameController, gameRepository };
}

/**
 * Configura la aplicación Express
 */
function createApp(): Application {
  const app = express();

  // Middleware
  app.use(cors({
    origin: config.corsOrigin,
    credentials: true
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Logging middleware (solo en desarrollo)
  if (config.nodeEnv === 'development') {
    app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  // Configurar dependencias
  const { gameController } = setupDependencies();

  // Rutas
  app.use('/api', createGameRoutes(gameController));

  // Ruta de health check
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'Solitario API'
    });
  });

  // Ruta raíz
  app.get('/', (req, res) => {
    res.json({
      message: '🃏 API del Solitario para la Abuelita',
      version: '1.0.0',
      endpoints: {
        health: 'GET /health',
        newGame: 'POST /api/game',
        getGame: 'GET /api/game/:id',
        draw: 'POST /api/game/:id/draw',
        move: 'POST /api/game/:id/move',
        autoComplete: 'POST /api/game/:id/foundation-auto',
        validateMove: 'POST /api/game/:id/validate-move'
      }
    });
  });

  // Manejador de errores 404
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: 'Ruta no encontrada',
      path: req.path
    });
  });

  // Manejador de errores global
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error no manejado:', err);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: config.nodeEnv === 'development' ? err.message : undefined
    });
  });

  return app;
}

/**
 * Inicia el servidor
 */
async function startServer() {
  try {
    // Inicializar Firebase primero
    initializeFirebase();
    
    // Crear aplicación Express
    const app = createApp();

    app.listen(config.port, () => {
      console.log('');
      console.log('═══════════════════════════════════════════════');
      console.log('🃏  Solitario API - Backend para la Abuelita  🃏');
      console.log('═══════════════════════════════════════════════');
      console.log(`🚀 Servidor corriendo en: http://localhost:${config.port}`);
      console.log(`🌍 Entorno: ${config.nodeEnv}`);
      console.log(`🔗 Health check: http://localhost:${config.port}/health`);
      console.log(`🔥 Firebase Firestore: ✅ Conectado`);
      console.log('═══════════════════════════════════════════════');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Error fatal al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Iniciar si se ejecuta directamente
if (require.main === module) {
  startServer();
}

export { createApp, setupDependencies, initializeFirebase };
