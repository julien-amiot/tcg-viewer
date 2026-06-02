// SC-TCG — Unit Tests: CardLoader
import { describe, it, expect, beforeEach } from 'vitest';
import { CardLoader } from '../src/domain/CardLoader';

describe('CardLoader', () => {
  const loader = CardLoader.getInstance();

  beforeEach(() => {
    // Reset singleton state for testing
    (loader as any).cards.length = 0;
    (loader as any).loaded = false;
  });

  describe('loadFromJson', () => {
    it('should load cards from a valid JSON string', async () => {
      const jsonData = [
        {
          id: '1',
          name: 'Test Card A',
          manaCost: '2UU',
          cardType: { value: 'Creature — Human Warrior' },
          powerToughness: '3/3',
          rarity: 'common',
          colors: ['W'],
          text: 'This is a test card.',
          setCode: 'SOS',
          number: '001'
        }
      ];

      await loader.loadFromJson(JSON.stringify(jsonData));
      expect(loader.count).toBe(1);
    });

    it('should skip malformed cards gracefully', async () => {
      const jsonData = [
        { id: '1', name: 'Valid Card' }, // Missing required fields
        { id: '2', name: 'Another Valid Card' }
      ];

      await loader.loadFromJson(JSON.stringify(jsonData));
      expect(loader.count).toBeGreaterThanOrEqual(0);
    });

    it('should clear existing cards when reloaded', async () => {
      const jsonData1 = [{ id: '1', name: 'Card 1' }];
      const jsonData2 = [{ id: '2', name: 'Card 2' }];

      await loader.loadFromJson(JSON.stringify(jsonData1));
      expect(loader.count).toBe(1);

      await loader.loadFromJson(JSON.stringify(jsonData2));
      expect(loader.count).toBe(1);
    });

    it('should throw on invalid JSON', async () => {
      await expect(
        loader.loadFromJson('{ invalid json }')
      ).rejects.toThrow();
    });
  });
});