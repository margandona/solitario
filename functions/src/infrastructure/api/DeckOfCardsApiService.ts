/**
 * CAPA DE INFRAESTRUCTURA - Servicio de API de Cartas
 * 
 * Implementación concreta del DeckProvider usando Deck of Cards API.
 * Esta es una implementación que puede ser reemplazada sin afectar el dominio.
 */

import axios from 'axios';
import { DeckProvider } from '../../domain/interfaces';
import { Card, Rank, Suit } from '../../domain/entities/Card';

interface DeckOfCardsApiCard {
  code: string;
  image: string;
  value: string;
  suit: string;
}

interface DeckOfCardsApiResponse {
  success: boolean;
  deck_id: string;
  cards: DeckOfCardsApiCard[];
  remaining: number;
}

export class DeckOfCardsApiService implements DeckProvider {
  private readonly baseUrl: string;

  constructor(baseUrl: string = 'https://deckofcardsapi.com/api/deck') {
    this.baseUrl = baseUrl;
  }

  async getShuffledDeck(): Promise<Card[]> {
    try {
      // Crear y barajar un nuevo mazo completo
      const response = await axios.get<DeckOfCardsApiResponse>(
        `${this.baseUrl}/new/shuffle/?deck_count=1`
      );

      if (!response.data.success) {
        throw new Error('Error al crear el mazo en la API externa');
      }

      const deckId = response.data.deck_id;

      // Obtener todas las 52 cartas
      const drawResponse = await axios.get<DeckOfCardsApiResponse>(
        `${this.baseUrl}/${deckId}/draw/?count=52`
      );

      if (!drawResponse.data.success || !drawResponse.data.cards) {
        throw new Error('Error al obtener las cartas de la API externa');
      }

      // Convertir las cartas de la API a nuestras entidades de dominio
      return drawResponse.data.cards.map((apiCard, index) => 
        this.convertApiCardToDomainCard(apiCard, index)
      );

    } catch (error) {
      console.error('Error al obtener mazo de la API:', error);
      // Fallback: generar un mazo localmente si la API falla
      return this.generateLocalDeck();
    }
  }

  /**
   * Convierte una carta de la API externa a nuestra entidad Card
   */
  private convertApiCardToDomainCard(apiCard: DeckOfCardsApiCard, index: number): Card {
    const suit = this.convertSuit(apiCard.suit);
    const rank = this.convertRank(apiCard.value);
    const id = `${rank}-${suit}-${index}`;

    return new Card(id, rank, suit, false);
  }

  /**
   * Convierte el palo de la API a nuestro tipo Suit
   */
  private convertSuit(apiSuit: string): Suit {
    const suitMap: Record<string, Suit> = {
      'HEARTS': 'HEARTS',
      'DIAMONDS': 'DIAMONDS',
      'CLUBS': 'CLUBS',
      'SPADES': 'SPADES'
    };

    return suitMap[apiSuit.toUpperCase()] || 'HEARTS';
  }

  /**
   * Convierte el valor de la API a nuestro tipo Rank
   */
  private convertRank(apiValue: string): Rank {
    const rankMap: Record<string, Rank> = {
      'ACE': 'A',
      'JACK': 'J',
      'QUEEN': 'Q',
      'KING': 'K'
    };

    const upperValue = apiValue.toUpperCase();
    return (rankMap[upperValue] || apiValue) as Rank;
  }

  /**
   * Genera un mazo localmente si la API no está disponible
   */
  private generateLocalDeck(): Card[] {
    const suits: Suit[] = ['HEARTS', 'DIAMONDS', 'CLUBS', 'SPADES'];
    const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    
    const cards: Card[] = [];
    
    for (const suit of suits) {
      for (const rank of ranks) {
        const id = `${rank}-${suit}`;
        cards.push(new Card(id, rank, suit, false));
      }
    }

    // Barajar usando Fisher-Yates
    return this.shuffleArray(cards);
  }

  /**
   * Algoritmo de Fisher-Yates para barajar
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
