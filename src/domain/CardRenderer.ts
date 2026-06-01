// CardRenderer - renders Card domain objects to DOM elements
import { Card } from './Card';

export class CardRenderer {
  private readonly grid: HTMLElement | null;

  constructor(gridId: string = 'cardGrid') {
    this.grid = document.getElementById(gridId);
    if (!this.grid) {
      throw new Error(`Card grid element '#${gridId}' not found`);
    }
  }

  render(cards: Card[]): void {
    this.grid!.innerHTML = '';
    for (const card of cards) {
      this.grid!.appendChild(this.createCardElement(card));
    }
  }

  private createCardElement(card: Card): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.className = 'card';
    wrapper.dataset.cardId = card.id;

    // Header: name + mana cost
    const header = document.createElement('div');
    header.className = 'card-header';

    const nameEl = document.createElement('span');
    nameEl.className = 'card-name';
    nameEl.textContent = card.name.value;

    const manaEl = document.createElement('span');
    manaEl.className = 'card-mana';
    manaEl.textContent = card.manaCost.value;

    header.appendChild(nameEl);
    header.appendChild(manaEl);

    // Color pips
    const colorRow = document.createElement('div');
    colorRow.className = 'card-colors';
    for (const color of card.colors) {
      const pip = document.createElement('span');
      pip.className = `color-pip ${color.value}`;
      colorRow.appendChild(pip);
    }

    // Body: type + text
    const body = document.createElement('div');
    body.className = 'card-body';

    const typeEl = document.createElement('div');
    typeEl.className = 'card-type';
    typeEl.textContent = card.cardType.value;

    const textEl = document.createElement('div');
    textEl.className = 'card-text';
    textEl.textContent = card.text;

    body.appendChild(typeEl);
    body.appendChild(textEl);

    // Footer: power/toughness + rarity
    const footer = document.createElement('div');
    footer.className = 'card-footer';

    if (card.hasPowerToughness) {
      const ptEl = document.createElement('span');
      ptEl.className = 'card-power-toughness';
      ptEl.textContent = card.powerToughness.display;
      footer.appendChild(ptEl);
    }

    const rarityEl = document.createElement('span');
    rarityEl.className = `card-rarity ${card.rarity.value}`;
    rarityEl.textContent = card.rarity.value;
    footer.appendChild(rarityEl);

    wrapper.appendChild(header);
    wrapper.appendChild(colorRow);
    wrapper.appendChild(body);
    wrapper.appendChild(footer);

    return wrapper;
  }
}
