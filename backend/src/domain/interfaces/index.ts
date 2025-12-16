/**
 * CAPA DE DOMINIO - Interfaces
 * 
 * Define abstracciones para los servicios externos.
 * Siguiendo el principio de Inversión de Dependencias (D de SOLID).
 */

import { Card } from '../entities/Card';

/**
 * Interfaz para proveedores de mazos de cartas.
 * La implementación concreta estará en la capa de infraestructura.
 */
export interface DeckProvider {
  /**
   * Obtiene un mazo completo de 52 cartas barajadas
   */
  getShuffledDeck(): Promise<Card[]>;
}

/**
 * Interfaz para el repositorio de estados de juego.
 * Permite persistir y recuperar partidas.
 */
export interface GameRepository {
  /**
   * Guarda un estado de juego
   */
  save(gameState: any): Promise<void>;

  /**
   * Obtiene un estado de juego por ID
   */
  findById(gameId: string): Promise<any | null>;

  /**
   * Elimina un estado de juego
   */
  delete(gameId: string): Promise<void>;

  /**
   * Obtiene todos los juegos activos
   */
  findAll(): Promise<any[]>;
}
