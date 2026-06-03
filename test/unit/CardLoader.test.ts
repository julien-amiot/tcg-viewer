// SC-TCG — Unit Tests: CardLoader
import { describe, it, expect, beforeEach } from 'vitest';
import { CardLoader } from '../../src/domain/CardLoader';

describe('CardLoader', () => {
  const loader = CardLoader.getInstance();

  beforeEach(() => {
    // Reset singleton state for testing
    (loader as any).cards.length = 0;
    (loader as any).loaded = false;
  });

  describe('loadFromJson', () => {
    it('should load cards from a valid JSON string', async () => {
      const rawCard = {
        uuid: '1',
        name: 'Test Card A',
        manaCost: '2UU',
        type: 'Creature — Human Warrior',
        text: 'This is a test card.',
        power: '3',
        toughness: '3',
        rarity: 'common',
        colors: ['U'],
        subtypes: ['Human', 'Warrior'],
        setCode: 'SOS',
        number: '001'
      };
      const jsonData = [rawCard];

      await loader.loadFromJson(JSON.stringify(jsonData));
      expect(loader.count).toBe(1);
    });

    it('should skip malformed cards gracefully', async () => {
      const rawCard = {
        uuid: '2',
        name: 'Valid Card',
        manaCost: '1W',
        type: 'Creature — Elf',
        text: '',
        rarity: 'common',
        colors: ['W'],
        subtypes: ['Elf'],
        setCode: 'SOS',
        number: '002'
      };
      const jsonData = [
        { id: '1', name: 'Invalid Card' }, // Missing required fields
        rawCard
      ];

      await loader.loadFromJson(JSON.stringify(jsonData));
      expect(loader.count).toBe(1);
    });

    it('should clear existing cards when reloaded', async () => {
      const makeRaw = (uuid: string, name: string) => ({
        uuid,
        name,
        manaCost: '0',
        type: 'Basic Land — Plains',
        text: '',
        rarity: 'common',
        colors: [],
        subtypes: ['Plains'],
        setCode: 'SOS',
        number: '100'
      });

      const jsonData1 = [makeRaw('1', 'Card 1')];
      const jsonData2 = [makeRaw('2', 'Card 2')];

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

    it('should set loaded flag to true after loading', async () => {
      const rawCard = {
        uuid: '1',
        name: 'Test Card A',
        manaCost: '2UU',
        type: 'Creature — Human Warrior',
        text: 'This is a test card.',
        power: '3',
        toughness: '3',
        rarity: 'common',
        colors: ['U'],
        subtypes: ['Human', 'Warrior'],
        setCode: 'SOS',
        number: '001'
      };
      const jsonData = [rawCard];

      expect(loader.isLoaded()).toBe(false);
      await loader.loadFromJson(JSON.stringify(jsonData));
      expect(loader.isLoaded()).toBe(true);
    });
  });

  describe('getAll', () => {
    it('should return a copy of the cards array', async () => {
      const rawCard = {
        uuid: '1',
        name: 'Test Card A',
        manaCost: '2UU',
        type: 'Creature — Human Warrior',
        text: 'This is a test card.',
        power: '3',
        toughness: '3',
        rarity: 'common',
        colors: ['U'],
        subtypes: ['Human', 'Warrior'],
        setCode: 'SOS',
        number: '001'
      };
      const jsonData = [rawCard];

      await loader.loadFromJson(JSON.stringify(jsonData));
      const cards = loader.getAll();
      expect(cards.length).toBe(1);
      // Ensure it's a copy, not the same reference
      cards.push(null as any);
      expect(loader.count).toBe(1);
    });
  });

  describe('count', () => {
    it('should return 0 when no cards are loaded', async () => {
      expect(loader.count).toBe(0);
    });

    it('should return the correct count after loading', async () => {
      const rawCard = {
        uuid: '1',
        name: 'Test Card A',
        manaCost: '2UU',
        type: 'Creature — Human Warrior',
        text: 'This is a test card.',
        power: '3',
        toughness: '3',
        rarity: 'common',
        colors: ['U'],
        subtypes: ['Human', 'Warrior'],
        setCode: 'SOS',
        number: '001'
      };
      const jsonData = [rawCard, rawCard];

      await loader.loadFromJson(JSON.stringify(jsonData));
      expect(loader.count).toBe(2);
    });
  });

  describe('isLoaded', () => {
    it('should return false initially', () => {
      expect(loader.isLoaded()).toBe(false);
    });
  });

  describe('singleton', () => {
    it('should always return the same instance', () => {
      const instance1 = CardLoader.getInstance();
      const instance2 = CardLoader.getInstance();
      expect(instance1).toBe(instance2);
    });
  });
});
