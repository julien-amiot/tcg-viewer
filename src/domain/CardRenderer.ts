// CardRenderer - renders Card domain objects to DOM elements
import { Card } from './Card';

const manaColorMap: Record<string, string> = {
  W: '#fff9c4',
  U: '#a8d4ff',
  B: '#555555',
  R: '#ffb3b3',
  G: '#b3ffb3',
};

const manaGradientMap: Record<string, string> = {
  UW: 'linear-gradient(135deg, #a8d4ff 50%, #fff9c4 50%)',
  BW: 'linear-gradient(135deg, #555555 50%, #fff9c4 50%)',
  RW: 'linear-gradient(135deg, #ffb3b3 50%, #fff9c4 50%)',
  GW: 'linear-gradient(135deg, #b3ffb3 50%, #fff9c4 50%)',
  UB: 'linear-gradient(135deg, #a8d4ff 50%, #555555 50%)',
  UR: 'linear-gradient(135deg, #a8d4ff 50%, #ffb3b3 50%)',
  UG: 'linear-gradient(135deg, #a8d4ff 50%, #b3ffb3 50%)',
  BR: 'linear-gradient(135deg, #555555 50%, #ffb3b3 50%)',
  BG: 'linear-gradient(135deg, #555555 50%, #b3ffb3 50%)',
  RG: 'linear-gradient(135deg, #ffb3b3 50%, #b3ffb3 50%)',
};

function parseManaCost(raw: string): Array<{ content: string; color?: string; gradient?: string }> {
  const tokens: Array<{ content: string; color?: string; gradient?: string }> = [];
  let i = 0;
  while (i < raw.length) {
    if (raw[i] === '{') {
      const end = raw.indexOf('}', i);
        if (end > -1) {
          const inner = raw.substring(i + 1, end);
          // Check for split cost like B/G
          if (inner.includes('/')) {
            const sortedParts = inner.split('/').toSorted((a, b) => a.localeCompare(b));
            const key = sortedParts.join('');
            tokens.push({ content: inner, gradient: manaGradientMap[key] });
        } else if (manaColorMap[inner]) {
          tokens.push({ content: inner, color: manaColorMap[inner] });
        } else {
          // Number or generic - pale grey
          tokens.push({ content: inner, color: '#cccccc' });
        }
        i = end + 1;
      } else {
        tokens.push({ content: raw[i] });
        i++;
      }
    } else {
      tokens.push({ content: raw[i] });
      i++;
    }
  }
  return tokens;
}

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

    // Header: name + mana cost dots
    const header = document.createElement('div');
    header.className = 'card-header';

    const nameEl = document.createElement('span');
    nameEl.className = 'card-name';
    nameEl.textContent = card.name.value;

    const manaContainer = document.createElement('span');
    manaContainer.className = 'card-mana-dots';
    const tokens = parseManaCost(card.manaCost.value);
    for (const token of tokens) {
      const dot = document.createElement('span');
      dot.className = 'mana-dot';
      // Show numbers and X (generic mana variable), hide color letters
      if (/^\d+$/.test(token.content) || token.content === 'X') {
        dot.textContent = token.content;
      }
      if (token.gradient) {
        dot.style.background = token.gradient;
      } else if (token.color) {
        dot.style.background = token.color;
      }
      manaContainer.appendChild(dot);
    }

    header.appendChild(nameEl);
    header.appendChild(manaContainer);

    // Body: type + setCode + text
    const body = document.createElement('div');
    body.className = 'card-body';

    const typeRow = document.createElement('div');
    typeRow.className = 'card-type-row';

    const typeEl = document.createElement('span');
    typeEl.className = 'card-type';
    typeEl.textContent = card.cardType.value;

    const setCodeEl = document.createElement('span');
    setCodeEl.className = 'card-setcode';
    setCodeEl.style.color = card.rarity.colorCode;
    setCodeEl.textContent = card.setCode;

    typeRow.appendChild(typeEl);
    typeRow.appendChild(setCodeEl);

    const textEl = document.createElement('div');
    textEl.className = 'card-text';
    textEl.textContent = card.text;

    let flavorEl: HTMLElement | null = null;
    if (card.flavorText) {
      flavorEl = document.createElement('div');
      flavorEl.className = 'card-flavor-text';
      flavorEl.style.fontStyle = 'italic';
      flavorEl.style.color = '#999';
      flavorEl.textContent = `"${card.flavorText}"`;
    }

    body.appendChild(typeRow);
    body.appendChild(textEl);
    if (flavorEl) {
      body.appendChild(flavorEl);
    }

    // Footer: artist + power/toughness
    const footer = document.createElement('div');
    footer.className = 'card-footer';

    if (card.artist) {
      const artistEl = document.createElement('span');
      artistEl.className = 'card-artist';
      artistEl.textContent = card.artist;
      footer.appendChild(artistEl);
    }

    if (card.hasPowerToughness) {
      const ptEl = document.createElement('span');
      ptEl.className = 'card-power-toughness';
      ptEl.textContent = card.powerToughness.display;
      footer.appendChild(ptEl);
    }

    wrapper.appendChild(header);
    wrapper.appendChild(body);
    wrapper.appendChild(footer);

    return wrapper;
  }
}
