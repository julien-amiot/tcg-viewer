// SC-TCG Main Entry Point
// Loads cards, renders grid, and wires filter controls

import { CardLoader } from './domain/CardLoader';
import { CardRenderer } from './domain/CardRenderer';
import { Card } from './domain/Card';
import { Color } from './domain/Color';

const loader = CardLoader.getInstance();
const renderer = new CardRenderer();
const countEl = document.getElementById('cardCount');

const searchInput = document.getElementById('searchInput') as HTMLInputElement | null;
const colorFilter = document.getElementById('colorFilter') as HTMLSelectElement | null;
const typeFilter = document.getElementById('typeFilter') as HTMLSelectElement | null;
const rarityFilter = document.getElementById('rarityFilter') as HTMLSelectElement | null;

function applyFilters(cards: Card[]): Card[] {
  const query = searchInput?.value?.toLowerCase().trim() ?? '';
  const color = colorFilter?.value ?? '';
  const type = typeFilter?.value ?? '';
  const rarity = rarityFilter?.value ?? '';

  return cards.filter(card => {
    if (query && !card.matchesName(query)) {
      return false;
    }
    if (color && !card.containsColor(Color.from(color))) {
      return false;
    }
    if (type && !card.cardType.value.toLowerCase().includes(type.toLowerCase())) {
      return false;
    }
    if (rarity && card.rarity.value !== rarity) {
      return false;
    }
    return true;
  });
}

function updateCount(total: number, visible: number): void {
  if (countEl) {
    countEl.textContent = visible === total
      ? `${visible} cards`
      : `${visible} of ${total} cards`;
  }
}

async function init(): Promise<void> {
  try {
    await loader.load();
    const all = loader.getAll();
    const filtered = applyFilters(all);
    renderer.render(filtered);
    updateCount(all.length, filtered.length);
  } catch (err) {
    console.error('Failed to initialize card viewer:', err);
    if (countEl) {
      countEl.textContent = 'Failed to load cards';
    }
  }

  // Wire filter change listeners
  searchInput?.addEventListener('input', () => {
    const filtered = applyFilters(loader.getAll());
    renderer.render(filtered);
    updateCount(loader.getAll().length, filtered.length);
  });

  colorFilter?.addEventListener('change', () => {
    const filtered = applyFilters(loader.getAll());
    renderer.render(filtered);
    updateCount(loader.getAll().length, filtered.length);
  });

  typeFilter?.addEventListener('change', () => {
    const filtered = applyFilters(loader.getAll());
    renderer.render(filtered);
    updateCount(loader.getAll().length, filtered.length);
  });

  rarityFilter?.addEventListener('change', () => {
    const filtered = applyFilters(loader.getAll());
    renderer.render(filtered);
    updateCount(loader.getAll().length, filtered.length);
  });
}

init();
