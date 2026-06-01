import { describe, it, expect } from 'vitest';
import { Card } from '../../src/domain/Card';
import { CardName } from '../../src/domain/CardName';
import { ManaCost } from '../../src/domain/ManaCost';
import { CardType } from '../../src/domain/CardType';
import { PowerToughness } from '../../src/domain/PowerToughness';
import { Rarity } from '../../src/domain/Rarity';
import { Color } from '../../src/domain/Color';

describe('Card', () => {
  it('creates a Card from options', () => {
    const card = new Card({
      id: 'uuid-1',
      name: CardName.from('Test Card'),
      manaCost: ManaCost.from('1R'),
      cardType: CardType.creature(['Human']),
      powerToughness: PowerToughness.from('2/2'),
      rarity: Rarity.common(),
      colors: [Color.from('R')],
      text: 'Test text',
      setCode: 'SOS',
      number: '001'
    });

    expect(card.id).toBe('uuid-1');
    expect(card.name.value).toBe('Test Card');
    expect(card.manaCost.value).toBe('1R');
    expect(card.text).toBe('Test text');
    expect(card.setCode).toBe('SOS');
  });

  it('fromRaw creates Card from raw data', () => {
    const raw = {
      uuid: 'abc-123',
      name: 'Lightning Bolt',
      manaCost: 'R',
      type: 'Instant',
      text: 'Deals 3 damage.',
      power: undefined,
      toughness: undefined,
      rarity: 'common',
      colors: ['R'],
      subtypes: [],
      setCode: 'SOS',
      number: '050'
    };

    const card = Card.fromRaw(raw);
    expect(card.name.value).toBe('Lightning Bolt');
    expect(card.manaCost.value).toBe('R');
    expect(card.isCreature).toBe(false);
    expect(card.hasPowerToughness).toBe(false);
  });

  it('fromRaw creates creature card with PT', () => {
    const raw = {
      uuid: 'abc-456',
      name: 'Goblin',
      manaCost: 'R',
      type: 'Creature',
      text: '',
      power: '1',
      toughness: '1',
      rarity: 'common',
      colors: ['R', 'G'],
      subtypes: ['Goblin'],
      setCode: 'SOS',
      number: '100'
    };

    const card = Card.fromRaw(raw);
    expect(card.isCreature).toBe(true);
    expect(card.hasPowerToughness).toBe(true);
    expect(card.colors.length).toBe(2);
  });

  it('matchesName is case-insensitive', () => {
    const card = Card.fromRaw({
      uuid: '1', name: 'Lightning Bolt', manaCost: 'R', type: 'Instant',
      text: '', rarity: 'common', colors: ['R'], subtypes: [],
      setCode: 'SOS', number: '001'
    });

    expect(card.matchesName('lightning')).toBe(true);
    expect(card.matchesName('BOLT')).toBe(true);
    expect(card.matchesName('goblin')).toBe(false);
  });

  it('containsColor checks color membership', () => {
    const card = Card.fromRaw({
      uuid: '1', name: 'Test', manaCost: 'WR', type: 'Creature',
      text: '', rarity: 'common', colors: ['W', 'R'], subtypes: [],
      setCode: 'SOS', number: '001'
    });

    expect(card.containsColor(Color.from('W'))).toBe(true);
    expect(card.containsColor(Color.from('B'))).toBe(false);
  });

  it('isLand returns true for land cards', () => {
    const card = Card.fromRaw({
      uuid: '1', name: 'Island', manaCost: '', type: 'Land',
      text: '', rarity: 'common', colors: [], subtypes: ['Island'],
      setCode: 'SOS', number: '001'
    });

    expect(card.isLand).toBe(true);
    expect(card.isCreature).toBe(false);
  });

  it('isLand returns false for non-land cards', () => {
    const card = Card.fromRaw({
      uuid: '1', name: 'Goblin', manaCost: 'R', type: 'Creature',
      text: '', rarity: 'common', colors: ['R'], subtypes: ['Goblin'],
      setCode: 'SOS', number: '001'
    });

    expect(card.isLand).toBe(false);
  });
});
