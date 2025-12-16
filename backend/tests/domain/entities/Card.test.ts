/**
 * Tests para la entidad Card
 */

import { Card } from '../../../src/domain/entities/Card';

describe('Card', () => {
  describe('color', () => {
    it('debe devolver RED para HEARTS', () => {
      const card = new Card('test-1', 'A', 'HEARTS', true);
      expect(card.color).toBe('RED');
    });

    it('debe devolver RED para DIAMONDS', () => {
      const card = new Card('test-2', 'K', 'DIAMONDS', true);
      expect(card.color).toBe('RED');
    });

    it('debe devolver BLACK para CLUBS', () => {
      const card = new Card('test-3', 'Q', 'CLUBS', true);
      expect(card.color).toBe('BLACK');
    });

    it('debe devolver BLACK para SPADES', () => {
      const card = new Card('test-4', 'J', 'SPADES', true);
      expect(card.color).toBe('BLACK');
    });
  });

  describe('value', () => {
    it('debe devolver 1 para As', () => {
      const card = new Card('test-1', 'A', 'HEARTS', true);
      expect(card.value).toBe(1);
    });

    it('debe devolver 13 para Rey', () => {
      const card = new Card('test-2', 'K', 'HEARTS', true);
      expect(card.value).toBe(13);
    });

    it('debe devolver valores numéricos correctos', () => {
      const card5 = new Card('test-3', '5', 'HEARTS', true);
      const card10 = new Card('test-4', '10', 'HEARTS', true);
      
      expect(card5.value).toBe(5);
      expect(card10.value).toBe(10);
    });
  });

  describe('canStackOnTableau', () => {
    it('debe permitir apilar carta negra sobre carta roja de valor mayor', () => {
      const redCard = new Card('test-1', '8', 'HEARTS', true);
      const blackCard = new Card('test-2', '7', 'CLUBS', true);
      
      expect(blackCard.canStackOnTableau(redCard)).toBe(true);
    });

    it('debe permitir apilar carta roja sobre carta negra de valor mayor', () => {
      const blackCard = new Card('test-1', '6', 'SPADES', true);
      const redCard = new Card('test-2', '5', 'DIAMONDS', true);
      
      expect(redCard.canStackOnTableau(blackCard)).toBe(true);
    });

    it('NO debe permitir apilar cartas del mismo color', () => {
      const redCard1 = new Card('test-1', '9', 'HEARTS', true);
      const redCard2 = new Card('test-2', '8', 'DIAMONDS', true);
      
      expect(redCard2.canStackOnTableau(redCard1)).toBe(false);
    });

    it('NO debe permitir apilar si el valor no es descendente', () => {
      const redCard = new Card('test-1', '7', 'HEARTS', true);
      const blackCard = new Card('test-2', '5', 'CLUBS', true);
      
      expect(blackCard.canStackOnTableau(redCard)).toBe(false);
    });
  });

  describe('canPlaceOnFoundation', () => {
    it('debe permitir colocar As en foundation vacía', () => {
      const ace = new Card('test-1', 'A', 'HEARTS', true);
      
      expect(ace.canPlaceOnFoundation(null)).toBe(true);
    });

    it('NO debe permitir colocar otra carta en foundation vacía', () => {
      const card = new Card('test-1', '5', 'HEARTS', true);
      
      expect(card.canPlaceOnFoundation(null)).toBe(false);
    });

    it('debe permitir colocar carta del mismo palo y valor siguiente', () => {
      const ace = new Card('test-1', 'A', 'HEARTS', true);
      const two = new Card('test-2', '2', 'HEARTS', true);
      
      expect(two.canPlaceOnFoundation(ace)).toBe(true);
    });

    it('NO debe permitir colocar carta de diferente palo', () => {
      const aceHearts = new Card('test-1', 'A', 'HEARTS', true);
      const twoClubs = new Card('test-2', '2', 'CLUBS', true);
      
      expect(twoClubs.canPlaceOnFoundation(aceHearts)).toBe(false);
    });
  });

  describe('flip', () => {
    it('debe voltear una carta boca abajo a boca arriba', () => {
      const card = new Card('test-1', 'K', 'SPADES', false);
      const flipped = card.flip();
      
      expect(flipped.faceUp).toBe(true);
      expect(card.faceUp).toBe(false); // Original no debe cambiar
    });

    it('debe voltear una carta boca arriba a boca abajo', () => {
      const card = new Card('test-1', 'Q', 'DIAMONDS', true);
      const flipped = card.flip();
      
      expect(flipped.faceUp).toBe(false);
    });
  });

  describe('serialization', () => {
    it('debe serializar y deserializar correctamente', () => {
      const original = new Card('test-1', '7', 'CLUBS', true);
      const json = original.toJSON();
      const restored = Card.fromJSON(json);
      
      expect(restored.id).toBe(original.id);
      expect(restored.rank).toBe(original.rank);
      expect(restored.suit).toBe(original.suit);
      expect(restored.faceUp).toBe(original.faceUp);
    });
  });
});
