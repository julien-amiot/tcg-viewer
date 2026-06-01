import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CardLoader } from '../../src/domain/CardLoader';
import { Card } from '../../src/domain/Card';

describe('CardLoader', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('loads cards from JSON path', async () => {
    const mockCards = {
      data: {
        cards: {
          'card-1': {
            uuid: 'card-1',
            name: 'Test Card',
            manaCost: '1',
            type: 'Creature',
            text: 'Test',
            power: '1',
            toughness: '1',
            rarity: 'common',
            colors: ['W'],
            subtypes: [],
            setCode: 'SOS',
            number: '001'
          }
        }
      }
    };

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockCards)
    });

    const { CardLoader: Loader } = await import('../../src/domain/CardLoader');
    const loader = Loader.getInstance();
    await loader.load('CARDS/test.json');

    expect(loader.isLoaded()).toBe(true);
    expect(loader.count).toBe(1);
    expect(loader.getAll()[0].name.value).toBe('Test Card');
  });

  it('skips cards that fail to parse', async () => {
    const mockCards = {
      data: {
        cards: {
          'card-1': {
            uuid: 'card-1',
            name: 'Valid',
            manaCost: '1',
            type: 'Instant',
            text: '',
            rarity: 'common',
            colors: ['R'],
            subtypes: [],
            setCode: 'SOS',
            number: '001'
          },
          'card-2': {
            uuid: 'card-2',
            name: '',
            manaCost: '',
            type: '',
            text: '',
            rarity: 'invalid',
            colors: [],
            subtypes: [],
            setCode: 'SOS',
            number: '002'
          }
        }
      }
    };

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockCards)
    });

    const { CardLoader: Loader } = await import('../../src/domain/CardLoader');
    const loader = Loader.getInstance();
    await loader.load('CARDS/test.json');

    expect(loader.count).toBe(1);
  });

  it('throws when fetch fails', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      statusText: 'Not Found'
    });

    const { CardLoader: Loader } = await import('../../src/domain/CardLoader');
    const loader = Loader.getInstance();
    await expect(loader.load('CARDS/missing.json')).rejects.toThrow('Failed to load cards');
  });

  it('returns singleton instance', async () => {
    const { CardLoader: Loader } = await import('../../src/domain/CardLoader');
    const a = Loader.getInstance();
    const b = Loader.getInstance();
    expect(a).toBe(b);
  });

  it('does not reload if already loaded', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { cards: {} } })
    });

    const { CardLoader: Loader } = await import('../../src/domain/CardLoader');
    const loader = Loader.getInstance();
    await loader.load();
    expect(loader.isLoaded()).toBe(true);
    await loader.load(); // second call should be no-op
  });

  it('getAll returns a copy', async () => {
    const mockCards = {
      data: {
        cards: {
          'c1': {
            uuid: 'c1', name: 'A', manaCost: '1', type: 'Instant',
            text: '', rarity: 'common', colors: ['W'], subtypes: [],
            setCode: 'SOS', number: '001'
          }
        }
      }
    };

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockCards)
    });

    const { CardLoader: Loader } = await import('../../src/domain/CardLoader');
    const loader = Loader.getInstance();
    await loader.load();

    const list1 = loader.getAll();
    const list2 = loader.getAll();
    expect(list1).not.toBe(list2);
  });
});
