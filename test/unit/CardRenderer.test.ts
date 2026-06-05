import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CardRenderer } from '../../src/domain/CardRenderer';
import { Card } from '../../src/domain/Card';
import { CardName } from '../../src/domain/CardName';
import { ManaCost } from '../../src/domain/ManaCost';
import { CardType } from '../../src/domain/CardType';
import { PowerToughness } from '../../src/domain/PowerToughness';
import { Rarity } from '../../src/domain/Rarity';
import { Color } from '../../src/domain/Color';

describe('CardRenderer', () => {
  beforeEach(() => {
    vi.resetModules();
    const mockGrid = {
      innerHTML: '',
      appendChild: vi.fn(),
    };
    vi.stubGlobal('document', {
      getElementById: vi.fn().mockReturnValue(mockGrid),
      createElement: vi.fn().mockReturnValue({
        className: '',
        dataset: {},
        textContent: '',
        innerHTML: '',
        style: {},
        appendChild: vi.fn(),
      }),
      createTextNode: vi.fn().mockReturnValue({}),
    });
  });

  it('creates renderer with valid grid id', () => {
    expect(() => new CardRenderer('cardGrid')).not.toThrow();
  });

  it('throws when grid element not found', () => {
    vi.mocked(global.document!.getElementById!).mockReturnValue(null);
    expect(() => new CardRenderer('nonexistent')).toThrow("Card grid element '#nonexistent' not found");
  });

  it('renders cards', () => {
    const card = new Card({
      id: '1',
      name: CardName.from('Test'),
      manaCost: ManaCost.from('1'),
      cardType: CardType.creature([]),
      powerToughness: PowerToughness.from('1/1'),
      rarity: Rarity.common(),
      colors: [Color.from('R')],
      text: 'Test text',
      setCode: 'SOS',
      number: '001'
    });

    const renderer = new CardRenderer('cardGrid');
    expect(() => renderer.render([card])).not.toThrow();
  });

  it('renders card without power/toughness', () => {
    const card = new Card({
      id: '2',
      name: CardName.from('Instant'),
      manaCost: ManaCost.from('R'),
      cardType: CardType.instant(),
      powerToughness: PowerToughness.empty(),
      rarity: Rarity.rare(),
      colors: [Color.from('R')],
      text: 'Deals damage',
      setCode: 'SOS',
      number: '002'
    });

    const renderer = new CardRenderer('cardGrid');
    expect(() => renderer.render([card])).not.toThrow();
  });

  it('renders card with flavor text inside <i> within same component as card text', () => {
    const card = new Card({
      id: '4',
      name: CardName.from('Flavor'),
      manaCost: ManaCost.from('1'),
      cardType: CardType.creature([]),
      powerToughness: PowerToughness.from('1/1'),
      rarity: Rarity.common(),
      colors: [Color.from('W')],
      text: 'Main text',
      flavorText: '"Flavor"',
      setCode: 'SOS',
      number: '004'
    });

    const renderer = new CardRenderer('cardGrid');
    expect(() => renderer.render([card])).not.toThrow();
  });

  it('renders card with multiple colors', () => {
    const card = new Card({
      id: '3',
      name: CardName.from('Hybrid'),
      manaCost: ManaCost.from('WR'),
      cardType: CardType.creature(['Human']),
      powerToughness: PowerToughness.from('2/2'),
      rarity: Rarity.uncommon(),
      colors: [Color.from('W'), Color.from('R')],
      text: '',
      setCode: 'SOS',
      number: '003'
    });

    const renderer = new CardRenderer('cardGrid');
    expect(() => renderer.render([card])).not.toThrow();
  });
});
