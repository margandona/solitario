/**
 * FRONTEND - Cliente API
 * 
 * Capa de infraestructura que se comunica con el backend.
 */

import axios, { AxiosInstance } from 'axios';
import type { GameState } from '../../domain/types';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class GameApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string = import.meta.env.VITE_API_URL || 'http://localhost:3000/api') {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
  }

  /**
   * Inicia una nueva partida
   */
  async startNewGame(): Promise<GameState> {
    const response = await this.client.post<ApiResponse<GameState>>('/game');
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Error al iniciar el juego');
    }

    return response.data.data;
  }

  /**
   * Obtiene el estado de una partida
   */
  async getGameState(gameId: string): Promise<GameState> {
    const response = await this.client.get<ApiResponse<GameState>>(`/game/${gameId}`);
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Error al obtener el estado del juego');
    }

    return response.data.data;
  }

  /**
   * Roba cartas del stock
   */
  async drawFromStock(gameId: string, count: number = 1): Promise<GameState> {
    const response = await this.client.post<ApiResponse<GameState>>(
      `/game/${gameId}/draw`,
      { count }
    );
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Error al robar cartas');
    }

    return response.data.data;
  }

  /**
   * Mueve carta(s) de una pila a otra
   */
  async moveCards(
    gameId: string,
    fromPileId: string,
    toPileId: string,
    cardCount: number = 1
  ): Promise<GameState> {
    const response = await this.client.post<ApiResponse<GameState>>(
      `/game/${gameId}/move`,
      { fromPileId, toPileId, cardCount }
    );
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Error al mover cartas');
    }

    return response.data.data;
  }

  /**
   * Auto-completa movimientos a las foundations
   */
  async autoCompleteFoundations(gameId: string): Promise<{ gameState: GameState; movedCount: number }> {
    const response = await this.client.post<ApiResponse<GameState> & { movedCount: number }>(
      `/game/${gameId}/foundation-auto`
    );
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Error al auto-completar');
    }

    return {
      gameState: response.data.data,
      movedCount: response.data.movedCount || 0
    };
  }

  /**
   * Valida si un movimiento es legal
   */
  async validateMove(
    gameId: string,
    fromPileId: string,
    toPileId: string,
    cardCount: number = 1
  ): Promise<{ valid: boolean; reason?: string }> {
    const response = await this.client.post<ApiResponse<{ valid: boolean; reason?: string }>>(
      `/game/${gameId}/validate-move`,
      { fromPileId, toPileId, cardCount }
    );
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Error al validar movimiento');
    }

    return response.data.data;
  }
}
