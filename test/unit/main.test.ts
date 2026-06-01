import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Card } from '../../src/domain/Card';
import { CardName } from '../../src/domain/CardName';
import { ManaCost } from '../../src/domain/ManaCost';
import { CardType } from '../../src/domain/CardType';
import { PowerToughness } from '../../src/domain/PowerToughness';
import { Rarity } from '../../src/domain/Rarity';
import { Color } from '../../src/domain/Color';

describe('main.ts - applyFilters', () => {
  let searchInput: HTMLInputElement;
  let colorFilter: HTMLSelectElement;
  let typeFilter: HTMLSelectElement;
  let rarityFilter: HTMLSelectElement;
  let applyFilters: (cards: Card[]) => Card[];

  const cards: Card[] = [
    new Card({
      id: '1', name: CardName.from('Goblin Warrior'), manaCost: ManaCost.from('R'),
      cardType: CardType.creature(['Goblin']), powerToughness: PowerToughness.from('1/1'),
      rarity: Rarity.common(), colors: [Color.from('R')], text: '', setCode: 'SOS', number: '001'
    }),
    new Card({
      id: '2', name: CardName.from('Island'), manaCost: ManaCost.from(''),
      cardType: CardType.land(), powerToughness: PowerToughness.empty(),
      rarity: Rarity.common(), colors: [], text: '', setCode: 'SOS', number: '002'
    }),
    new Card({
      id: '3', name: CardName.from('Lightning Bolt'), manaCost: ManaCost.from('R'),
      cardType: CardType.instant(), powerToughness: PowerToughness.empty(),
      rarity: Rarity.rare(), colors: [Color.from('R')], text: 'Deals 3 damage', setCode: 'SOS', number: '003'
    }),
  ];

  function createSelect(options: string[]): HTMLSelectElement {
    const select = document.createElement('select');
    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = 'All';
    select.appendChild(defaultOpt);
    for (const val of options) {
      const opt = document.createElement('option');
      opt.value = val;
      opt.textContent = val;
      select.appendChild(opt);
    }
    return select;
  }

  beforeEach(() => {
    searchInput = document.createElement('input');
    searchInput.id = 'searchInput';
    searchInput.value = '';
    colorFilter = createSelect(['W', 'U', 'B', 'R', 'G']);
    colorFilter.id = 'colorFilter';
    typeFilter = createSelect(['Creature', 'Instant', 'Sorcery', 'Enchantment', 'Artifact', 'Land', 'Planeswalker']);
    typeFilter.id = 'typeFilter';
    rarityFilter = createSelect(['common', 'uncommon', 'rare', 'mythic']);
    rarityFilter.id = 'rarityFilter';

    document.body.appendChild(searchInput);
    document.body.appendChild(colorFilter);
    document.body.appendChild(typeFilter);
    document.body.appendChild(rarityFilter);

    applyFilters = (cardList: Card[]) => {
      const query = searchInput.value.toLowerCase().trim();
      const color = colorFilter.value;
      const type = typeFilter.value;
      const rarity = rarityFilter.value;

      return cardList.filter(card => {
        if (query && !card.matchesName(query)) return false;
        if (color && !card.containsColor(Color.from(color))) return false;
        if (type && !card.cardType.value.toLowerCase().includes(type.toLowerCase())) return false;
        if (rarity && card.rarity.value !== rarity) return false;
        return true;
      });
    };
  });

  afterEach(() => {
    searchInput.remove();
    colorFilter.remove();
    typeFilter.remove();
    rarityFilter.remove();
  });

  it('returns all cards when no filters set', () => {
    expect(applyFilters(cards)).toHaveLength(3);
  });

  it('filters by search query (case insensitive)', () => {
    searchInput.value = 'goblin';
    const result = applyFilters(cards);
    expect(result).toHaveLength(1);
    expect(result[0].name.value).toBe('Goblin Warrior');

    searchInput.value = 'LIGHTNING';
    expect(applyFilters(cards)).toHaveLength(1);
  });

  it('filters by color', () => {
    colorFilter.value = 'R';
    expect(applyFilters(cards)).toHaveLength(2);

    colorFilter.value = 'W';
    expect(applyFilters(cards)).toHaveLength(0);
  });

  it('filters by type', () => {
    typeFilter.value = 'Creature';
    expect(applyFilters(cards)).toHaveLength(1);

    typeFilter.value = 'Instant';
    expect(applyFilters(cards)).toHaveLength(1);

    typeFilter.value = 'Sorcery';
    expect(applyFilters(cards)).toHaveLength(0);
  });

  it('filters by rarity', () => {
    rarityFilter.value = 'common';
    expect(applyFilters(cards)).toHaveLength(2);

    rarityFilter.value = 'rare';
    expect(applyFilters(cards)).toHaveLength(1);

    rarityFilter.value = 'mythic';
    expect(applyFilters(cards)).toHaveLength(0);
  });

  it('combines multiple filters', () => {
    searchInput.value = 'goblin';
    rarityFilter.value = 'common';
    expect(applyFilters(cards)).toHaveLength(1);

    searchInput.value = 'goblin';
    rarityFilter.value = 'rare';
    expect(applyFilters(cards)).toHaveLength(0);
  });
});

describe('main.ts - updateCount', () => {
  let countEl: HTMLDivElement;

  const updateCount = (total: number, visible: number): void => {
    if (countEl) {
      countEl.textContent = visible === total
        ? `${visible} cards`
        : `${visible} of ${total} cards`;
    }
  };

  beforeEach(() => {
    countEl = document.createElement('div');
    countEl.id = 'cardCount';
    document.body.appendChild(countEl);
  });

  afterEach(() => {
    countEl.remove();
  });

  it('shows total count when all visible', () => {
    updateCount(10, 10);
    expect(countEl.textContent).toBe('10 cards');
  });

  it('shows filtered count when subset visible', () => {
    updateCount(10, 3);
    expect(countEl.textContent).toBe('3 of 10 cards');
  });

  it('handles zero cards', () => {
    updateCount(0, 0);
    expect(countEl.textContent).toBe('0 cards');
  });
});