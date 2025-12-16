/**
 * Configuración de la aplicación
 */

import path from 'path';

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  deckApiUrl: process.env.DECK_API_URL || 'https://deckofcardsapi.com/api/deck',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  
  // Firebase Configuration
  firebase: {
    credentialsPath: process.env.FIREBASE_CREDENTIALS_PATH || 
      path.join(__dirname, 'culinary-1613e-firebase-adminsdk-fbsvc-0fdd949351.json'),
    collectionName: process.env.FIREBASE_COLLECTION || 'games',
  },
};
