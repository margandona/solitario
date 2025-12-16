/**
 * CAPA DE INFRAESTRUCTURA - Repositorio Firebase (Firestore)
 * 
 * Implementación del GameRepository usando Cloud Firestore.
 * Esta implementación reemplaza InMemoryGameRepository para persistencia real.
 */

import * as admin from 'firebase-admin';
import { GameRepository } from '../../domain/interfaces';
import { GameState } from '../../domain/entities/GameState';

export class FirebaseGameRepository implements GameRepository {
  private db: admin.firestore.Firestore;
  private collection: admin.firestore.CollectionReference;

  constructor() {
    this.db = admin.firestore();
    this.collection = this.db.collection('games');
  }

  /**
   * Guarda o actualiza un estado de juego en Firestore
   */
  async save(gameState: GameState): Promise<void> {
    try {
      const data = gameState.toJSON();
      
      await this.collection.doc(gameState.id).set({
        ...data,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      console.log(`✅ Juego ${gameState.id} guardado en Firestore`);
    } catch (error) {
      console.error('Error al guardar en Firestore:', error);
      throw new Error(`No se pudo guardar el juego: ${(error as Error).message}`);
    }
  }

  /**
   * Obtiene un estado de juego por ID desde Firestore
   */
  async findById(gameId: string): Promise<any | null> {
    try {
      const doc = await this.collection.doc(gameId).get();

      if (!doc.exists) {
        return null;
      }

      const data = doc.data();
      
      // Eliminar el campo updatedAt que agregamos
      if (data) {
        delete data.updatedAt;
      }

      return data;
    } catch (error) {
      console.error('Error al buscar juego en Firestore:', error);
      throw new Error(`No se pudo buscar el juego: ${(error as Error).message}`);
    }
  }

  /**
   * Elimina un juego de Firestore
   */
  async delete(gameId: string): Promise<void> {
    try {
      await this.collection.doc(gameId).delete();
      console.log(`🗑️ Juego ${gameId} eliminado de Firestore`);
    } catch (error) {
      console.error('Error al eliminar juego de Firestore:', error);
      throw new Error(`No se pudo eliminar el juego: ${(error as Error).message}`);
    }
  }

  /**
   * Obtiene todos los juegos almacenados
   * Útil para estadísticas y análisis
   */
  async findAll(): Promise<any[]> {
    try {
      const snapshot = await this.collection.get();
      
      const games: any[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        delete data.updatedAt; // Eliminar campo auxiliar
        games.push(data);
      });

      return games;
    } catch (error) {
      console.error('Error al obtener todos los juegos de Firestore:', error);
      throw new Error(`No se pudieron obtener los juegos: ${(error as Error).message}`);
    }
  }

  /**
   * Encuentra juegos por estado (PLAYING, WON, LOST)
   */
  async findByStatus(status: 'PLAYING' | 'WON' | 'LOST'): Promise<any[]> {
    try {
      const snapshot = await this.collection
        .where('status', '==', status)
        .get();

      const games: any[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        delete data.updatedAt;
        games.push(data);
      });

      return games;
    } catch (error) {
      console.error('Error al buscar juegos por estado:', error);
      throw new Error(`No se pudieron buscar juegos: ${(error as Error).message}`);
    }
  }

  /**
   * Encuentra juegos activos (PLAYING) con más de X horas de antigüedad
   * Útil para limpiar juegos abandonados
   */
  async findAbandonedGames(hoursOld: number = 24): Promise<any[]> {
    try {
      const cutoffTime = new Date();
      cutoffTime.setHours(cutoffTime.getHours() - hoursOld);

      const snapshot = await this.collection
        .where('status', '==', 'PLAYING')
        .where('startTime', '<', cutoffTime.toISOString())
        .get();

      const games: any[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        delete data.updatedAt;
        games.push(data);
      });

      return games;
    } catch (error) {
      console.error('Error al buscar juegos abandonados:', error);
      return [];
    }
  }

  /**
   * Limpia juegos antiguos (más de 30 días)
   */
  async cleanOldGames(daysOld: number = 30): Promise<number> {
    try {
      const cutoffTime = new Date();
      cutoffTime.setDate(cutoffTime.getDate() - daysOld);

      const snapshot = await this.collection
        .where('startTime', '<', cutoffTime.toISOString())
        .get();

      const batch = this.db.batch();
      let count = 0;

      snapshot.forEach(doc => {
        batch.delete(doc.ref);
        count++;
      });

      await batch.commit();
      console.log(`🧹 Limpiados ${count} juegos antiguos de Firestore`);

      return count;
    } catch (error) {
      console.error('Error al limpiar juegos antiguos:', error);
      return 0;
    }
  }

  /**
   * Obtiene estadísticas de uso
   */
  async getStatistics(): Promise<{
    totalGames: number;
    gamesPlaying: number;
    gamesWon: number;
    gamesLost: number;
  }> {
    try {
      const snapshot = await this.collection.get();
      
      let totalGames = 0;
      let gamesPlaying = 0;
      let gamesWon = 0;
      let gamesLost = 0;

      snapshot.forEach(doc => {
        totalGames++;
        const data = doc.data();
        
        if (data.status === 'PLAYING') gamesPlaying++;
        else if (data.status === 'WON') gamesWon++;
        else if (data.status === 'LOST') gamesLost++;
      });

      return { totalGames, gamesPlaying, gamesWon, gamesLost };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return { totalGames: 0, gamesPlaying: 0, gamesWon: 0, gamesLost: 0 };
    }
  }
}
