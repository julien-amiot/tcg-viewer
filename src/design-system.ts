// Design System Showcase
// Loads card data and renders one specimen per unique CSS class combination.
// This file is loaded only on the /design-system.html page.

import { CardLoader } from './domain/CardLoader';
import { Card } from './domain/Card';
import { CardRenderer } from './domain/CardRenderer';

interface Specimen {
  card: Card;
  label: string;
}

function collectSpecimens(cards: Card[]): Specimen[] {
  // Build unique key from CSS classes
  const seen = new Map<string, Specimen>();
  for (const card of cards) {
    const classes = [
      card.cssLayout,
      ...card.cssTypes,
      ...card.cssSupertypes,
      card.cssFrameVersion,
      card.cssColorIdentity,
      card.cssRarity,
    ].join(' ');
    if (!seen.has(classes)) {
      seen.set(classes, { card, label: classes });
    }
  }
  return [...seen.values()];
}

function renderSpecimen(specimen: Specimen, container: HTMLElement): void {
  const wrapper = document.createElement('div');
  wrapper.className = 'showcase-specimen';

  const label = document.createElement('div');
  label.className = 'showcase-specimen-label';
  label.textContent = specimen.label;
  wrapper.appendChild(label);

  // Render the card inside the specimen container
  const renderer = new CardRenderer('');
  const cardEl = renderer.createCardElement(specimen.card);
  cardEl.classList.add('showcase-card--scaled');
  wrapper.appendChild(cardEl);

  container.appendChild(wrapper);
}

async function init(): Promise<void> {
  const container = document.getElementById('showcase-container');
  if (!container) return;

  try {
    const loader = CardLoader.getInstance();
    await loader.load();
    const cards = loader.getAll();
    const specimens = collectSpecimens(cards);

    // Group specimens by layout
    const byLayout = new Map<string, Specimen[]>();
    for (const s of specimens) {
      const layout = s.card.cssLayout;
      if (!byLayout.has(layout)) byLayout.set(layout, []);
      byLayout.get(layout)!.push(s);
    }

    for (const [layout, items] of byLayout) {
      const section = document.createElement('section');
      section.className = 'showcase-section';
      const h2 = document.createElement('h2');
      h2.textContent = `Layout: ${layout}`;
      section.appendChild(h2);

      const grid = document.createElement('div');
      grid.className = 'showcase-grid';

      for (const s of items) {
        renderSpecimen(s, grid);
      }

      section.appendChild(grid);
      container.appendChild(section);
    }

    // Summary
    const summary = document.createElement('p');
    summary.classList.add('showcase-summary');
    summary.textContent = `Total unique specimens: ${specimens.length} across ${byLayout.size} layout groups`;
    container.appendChild(summary);
  } catch (err) {
    console.error('Failed to load design system showcase:', err);
    container.textContent = 'Failed to load showcase data.';
  }
}

// Expose loader for testing
(globalThis as any).designSystemInit = init;

init();