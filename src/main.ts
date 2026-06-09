// SC-TCG Main Entry Point
// Loads cards, renders grid, and wires filter controls

import { CardLoader } from './domain/CardLoader';
import { CardRenderer } from './domain/CardRenderer';
import { Card } from './domain/Card';
import { Color } from './domain/Color';
import { SetStorage } from './domain/SetStorage';

const loader = CardLoader.getInstance();
const renderer = new CardRenderer();
const countEl = document.getElementById('cardCount');
const setStorage = SetStorage.getInstance();

const searchInput = document.getElementById('searchInput') as HTMLInputElement | null;
const colorFilter = document.getElementById('colorFilter') as HTMLSelectElement | null;
const typeFilter = document.getElementById('typeFilter') as HTMLSelectElement | null;
const rarityFilter = document.getElementById('rarityFilter') as HTMLSelectElement | null;
const setSelector = document.getElementById('setSelector') as HTMLSelectElement | null;

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

    // Populate set selector with saved sets from localStorage
    if (setSelector) {
      setSelector.innerHTML = '<option value="">-- Select a Set --</option>';
      const savedSets = setStorage.listSets();
      for (const setName of savedSets) {
        const option = document.createElement('option');
        option.value = setName;
        option.textContent = setName;
        setSelector.appendChild(option);
      }
    }
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

  // Wire set selector change listener
  if (setSelector) {
    setSelector.addEventListener('change', async () => {
      const selectedSet = setSelector?.value;
      if (!selectedSet) return;
      const jsonData = setStorage.loadSet(selectedSet);
      if (!jsonData) return;
      await loader.loadFromJson(jsonData);
      const filtered = applyFilters(loader.getAll());
      renderer.render(filtered);
      updateCount(loader.getAll().length, filtered.length);
    });
  }

  function updateSetSelector(): void {
    if (!setSelector) return;
    setSelector.innerHTML = '<option value="">-- Select a Set --</option>';
    const savedSets = setStorage.listSets();
    for (const setName of savedSets) {
      const option = document.createElement('option');
      option.value = setName;
      option.textContent = setName;
      setSelector.appendChild(option);
    }
  }

  // Wire save set button listener
  document.getElementById('saveSetButton')?.addEventListener('click', () => {
    const cards = loader.getAll();
    if (cards.length === 0) {
      alert('No cards to save. Load a set first.');
      return;
    }
    // Remove any previous input (e.g. from a prior click) to avoid duplicate IDs
    const existing = document.getElementById('set-name-input');
    if (existing) {
      document.body.removeChild(existing);
    }

    // Show an input dialog for the set name
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = 'My Custom Set';
    nameInput.id = 'set-name-input';
    nameInput.setAttribute('style', 'display:block;margin:10px auto;padding:8px;font-size:14px;');
    document.body.appendChild(nameInput);
    nameInput.focus();
    nameInput.select();

    const handleSave = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        const name = nameInput.value.trim();
        if (!name) return;
        const jsonData = JSON.stringify(cards, null, 2);
        setStorage.saveSet(name, jsonData);
        updateSetSelector();
        alert(`Set "${name}" saved!`);
      } else if (e.key === 'Escape') {
        // Cancel
      }
      document.body.removeChild(nameInput);
    };

    nameInput.addEventListener('keydown', handleSave);
  });

  // Wire file upload listener
  document.getElementById('jsonUploadInput')?.addEventListener('change', async (e) => {
    const input = e.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    if (!file.name.toLowerCase().endsWith('.json')) {
      alert('Please select a valid JSON file.');
      return;
    }
    try {
      const text = await file.text();
      await loader.loadFromJson(text);
      const filtered = applyFilters(loader.getAll());
      renderer.render(filtered);
      updateCount(loader.getAll().length, filtered.length);
      alert(`Loaded ${loader.count} cards from "${file.name}"`);
    } catch (err) {
      console.error('Failed to load JSON:', err);
      alert('Error loading JSON file.');
    }
    // Reset input so same file can be selected again
    input.value = '';
  });

  // Wire clear filters button listener
  document.getElementById('clearFiltersButton')?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    if (colorFilter) colorFilter.value = '';
    if (typeFilter) typeFilter.value = '';
    if (rarityFilter) rarityFilter.value = '';
    const filtered = applyFilters(loader.getAll());
    renderer.render(filtered);
    updateCount(loader.getAll().length, filtered.length);
  });
}

// Expose for testing (E2E via Playwright)
(window as any).CardLoader = CardLoader;
(window as any).SetStorage = SetStorage;
(window as any).loader = loader;
(window as any).setSelector = setSelector;

init();
