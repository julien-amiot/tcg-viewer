import { describe, it, expect } from 'vitest';
import { Card } from '../../src/domain/Card';
import { CardName } from '../../src/domain/CardName';
import { ManaCost } from '../../src/domain/ManaCost';
import { CardType } from '../../src/domain/CardType';
import { PowerToughness } from '../../src/domain/PowerToughness';
import { InitialLoyalty } from '../../src/domain/InitialLoyalty';
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
      initialLoyalty: InitialLoyalty.empty(),
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
      number: '050',
      layout: 'normal',
      supertypes: [],
      types: ['Instant'],
      frameVersion: '2015'
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
      number: '100',
      layout: 'normal',
      supertypes: [],
      types: ['Creature'],
      frameVersion: '2015'
    };

    const card = Card.fromRaw(raw);
    expect(card.isCreature).toBe(true);
    expect(card.hasPowerToughness).toBe(true);
    expect(card.hasInitialLoyalty).toBe(false);
    expect(card.colors.length).toBe(2);
  });

  it('matchesName is case-insensitive', () => {
    const card = Card.fromRaw({
      uuid: '1', name: 'Lightning Bolt', manaCost: 'R', type: 'Instant',
      text: '', rarity: 'common', colors: ['R'], subtypes: [],
      setCode: 'SOS', number: '001', layout: 'normal', supertypes: [],
      types: ['Instant'], frameVersion: '2015'
    });

    expect(card.matchesName('lightning')).toBe(true);
    expect(card.matchesName('BOLT')).toBe(true);
    expect(card.matchesName('goblin')).toBe(false);
  });

  it('containsColor checks color membership', () => {
    const card = Card.fromRaw({
      uuid: '1', name: 'Test', manaCost: 'WR', type: 'Creature',
      text: '', rarity: 'common', colors: ['W', 'R'], subtypes: [],
      setCode: 'SOS', number: '001', layout: 'normal', supertypes: [],
      types: ['Creature'], frameVersion: '2015'
    });

    expect(card.containsColor(Color.from('W'))).toBe(true);
    expect(card.containsColor(Color.from('B'))).toBe(false);
  });

  it('isLand returns true for land cards', () => {
    const card = Card.fromRaw({
      uuid: '1', name: 'Island', manaCost: '', type: 'Land',
      text: '', rarity: 'common', colors: [], subtypes: ['Island'],
      setCode: 'SOS', number: '001', layout: 'normal', supertypes: [],
      types: ['Land'], frameVersion: '2015'
    });

    expect(card.isLand).toBe(true);
    expect(card.isCreature).toBe(false);
  });

  it('isLand returns false for non-land cards', () => {
    const card = Card.fromRaw({
      uuid: '1', name: 'Goblin', manaCost: 'R', type: 'Creature',
      text: '', rarity: 'common', colors: ['R'], subtypes: ['Goblin'],
      setCode: 'SOS', number: '001', layout: 'normal', supertypes: [],
      types: ['Creature'], frameVersion: '2015'
    });

    expect(card.isLand).toBe(false);
  });

  it('fromRaw populates imageUrl when provided', () => {
    const raw = {
      uuid: 'img-1', name: 'Image Card', manaCost: 'G', type: 'Creature',
      text: '', rarity: 'common', colors: ['G'], subtypes: ['Beast'],
      setCode: 'SOS', number: '001', imageUrl: 'https://example.com/card.png',
      layout: 'normal', supertypes: [], types: ['Creature'], frameVersion: '2015'
    };

    const card = Card.fromRaw(raw);
    expect(card.imageUrl).toBe('https://example.com/card.png');
  });

  it('fromRaw leaves imageUrl undefined when not provided', () => {
    const raw = {
      uuid: 'img-2', name: 'No Image', manaCost: 'W', type: 'Creature',
      text: '', rarity: 'common', colors: ['W'], subtypes: [],
      setCode: 'SOS', number: '002', layout: 'normal', supertypes: [],
      types: ['Creature'], frameVersion: '2015'
    };

    const card = Card.fromRaw(raw);
    expect(card.imageUrl).toBeUndefined();
  });

  it('fromRaw creates planeswalker card with loyalty', () => {
    const raw = {
      uuid: 'abc-789',
      name: 'Chandra, Torch of Defiance',
      manaCost: '3RR',
      type: 'Planeswalker',
      text: '+L: This card deals 1 damage to any target.',
      power: undefined,
      toughness: undefined,
      loyalty: '4',
      rarity: 'mythic',
      colors: ['R'],
      subtypes: ['Chandra'],
      setCode: 'SOS',
      number: '200',
      layout: 'normal',
      supertypes: ['Legendary'],
      types: ['Planeswalker'],
      frameVersion: '2015'
    };

    const card = Card.fromRaw(raw);
    expect(card.hasInitialLoyalty).toBe(true);
    expect(card.initialLoyalty.value).toBe('4');
  });

  it('creates Card with imageUrl via constructor', () => {
    const card = new Card({
      id: 'img-3',
      name: CardName.from('Test'),
      manaCost: ManaCost.from('1'),
      cardType: CardType.creature([]),
      powerToughness: PowerToughness.empty(),
      initialLoyalty: InitialLoyalty.empty(),
      rarity: Rarity.common(),
      colors: [],
      text: '',
      setCode: 'SOS',
      number: '003',
      imageUrl: 'https://example.com/img.jpg'
    });

    expect(card.imageUrl).toBe('https://example.com/img.jpg');
  });

  it('creates a planeswalker card without loyalty value', () => {
    const raw = {
      uuid: 'pw-1',
      name: 'Jace, the Mind Sculptor',
      manaCost: '{3}{U}',
      type: 'Planeswalker',
      text: '+1: Draw a card.',
      rarity: 'mythic',
      colors: ['U'],
      subtypes: ['Jace'],
      setCode: 'SOS',
      number: '007',
      layout: 'normal',
      supertypes: ['Legendary'],
      types: ['Planeswalker'],
      frameVersion: '2015'
    };

    const card = Card.fromRaw(raw);
    expect(card.isCreature).toBe(false);
    expect(card.hasPowerToughness).toBe(false);
    expect(card.hasInitialLoyalty).toBe(false);
  });

  it('creates a planeswalker card with loyalty value', () => {
    const raw = {
      uuid: 'pw-2',
      name: 'Chandra, Torch of Defiance',
      manaCost: '{3}{R}{R}',
      type: 'Planeswalker — Chandra',
      text: '+1: Chandra deals 1 damage to any target.',
      rarity: 'mythic',
      colors: ['R'],
      subtypes: ['Chandra'],
      loyalty: '4',
      setCode: 'SOS',
      number: '025',
      layout: 'normal',
      supertypes: ['Legendary'],
      types: ['Planeswalker'],
      frameVersion: '2015'
    };

    const card = Card.fromRaw(raw);
    expect(card.hasInitialLoyalty).toBe(true);
    expect(card.initialLoyalty.value).toBe('4');
  });
});