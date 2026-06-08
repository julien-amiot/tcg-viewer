// CardRenderer - renders Card domain objects to DOM elements
import { Card } from './Card';

const manaColorMap: Record<string, string> = {
  W: '#fff9c4',
  U: '#a8d4ff',
  B: '#555555',
  R: '#ffb3b3',
  G: '#b3ffb3',
};

const colorOrder = ['W', 'U', 'B', 'R', 'G'];

function hexToRgba(hex: string): [number, number, number] {
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function getTextAreaBackground(colors: string[]): string {
  if (colors.length === 0) return 'rgba(128, 128, 128, 0.4)';
  if (colors.length > 3) return 'rgba(255, 193, 7, 0.4)';

  const sorted = [...colors].sort((a, b) => colorOrder.indexOf(a) - colorOrder.indexOf(b));
  const hexColors = sorted.map(c => manaColorMap[c] || '#cccccc');

  if (sorted.length === 1) {
    const [r, g, b] = hexToRgba(hexColors[0]);
    return `rgba(${r}, ${g}, ${b}, 0.4)`;
  }

  const n = sorted.length - 1;
  const gradientStops = hexColors.map((hex, i) => {
    const [r, g, b] = hexToRgba(hex);
    return `rgba(${r}, ${g}, ${b}, 0.4) ${(i / n) * 100}%`;
  });

  return `linear-gradient(135deg, ${gradientStops.join(', ')})`;
}

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

function createManaDot(content: string, color?: string, gradient?: string): HTMLElement {
  const dot = document.createElement('span');
  dot.className = 'mana-dot';
  if (/^\d+$/.test(content) || content === 'X' || content === 'T') {
    dot.textContent = content;
  }
  if (gradient) {
    dot.style.background = gradient;
  } else if (color) {
    dot.style.background = color;
  }
  return dot;
}

function renderManaToken(inner: string): HTMLElement {
  if (inner.includes('/')) {
    const sortedParts = inner.split('/').toSorted((a, b) => a.localeCompare(b));
    const key = sortedParts.join('');
    const gradient = manaGradientMap[key];
    return createManaDot(inner, undefined, gradient);
  }
  if (manaColorMap[inner]) {
    return createManaDot(inner, manaColorMap[inner]);
  }
  // Numbers, X, T, or generic — pale grey
  return createManaDot(inner, '#cccccc');
}

function renderTextWithManaDots(text: string): HTMLElement {
  const container = document.createElement('span');
  let i = 0;
  while (i < text.length) {
    if (text[i] === '{') {
      const end = text.indexOf('}', i);
      if (end > -1) {
        const inner = text.substring(i + 1, end);
        container.appendChild(renderManaToken(inner));
        i = end + 1;
      } else {
        container.appendChild(document.createTextNode(text[i]));
        i++;
      }
    } else if (text[i] === '\n') {
      container.appendChild(document.createElement('br'));
      i++;
    } else {
      // Collect consecutive plain characters
      let start = i;
      while (i < text.length && text[i] !== '{' && text[i] !== '\n') i++;
      container.appendChild(document.createTextNode(text.substring(start, i)));
    }
  }
  return container;
}

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

    if (card.imageUrl) {
      wrapper.style.backgroundImage = `url('${card.imageUrl}')`;
      wrapper.style.backgroundSize = 'cover';
    }

    // Header: name + mana cost dots
    const header = document.createElement('div');
    header.className = 'card-header';
    const colorValues = card.colors.map(c => c.value);
    header.style.background = getTextAreaBackground(colorValues);

    const nameEl = document.createElement('span');
    nameEl.className = 'card-name';
    const displayName = card.faceName ? card.faceName : card.name.value;
    nameEl.textContent = displayName;

    const manaContainer = document.createElement('span');
    manaContainer.className = 'card-mana-dots';
    const tokens = parseManaCost(card.manaCost.value);
    for (const token of tokens) {
      const dot = document.createElement('span');
      dot.className = 'mana-dot mana-dot-title';
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

    // Separator between header and body
    const separator = document.createElement('div');
    separator.className = 'card-separator';

    // Body: type + setCode + text
    const body = document.createElement('div');
    body.className = 'card-body';
    body.style.background = getTextAreaBackground(colorValues);

    const typeRow = document.createElement('div');
    typeRow.className = 'card-type-row';

    const typeEl = document.createElement('span');
    typeEl.className = 'card-type';
    typeEl.textContent = card.cardType.value;

    const setCodeEl = document.createElement('span');
    setCodeEl.className = 'card-setcode';
    setCodeEl.style.color = card.rarity.colorCode;
    if (card.rarity.isCommon) {
      setCodeEl.style.textShadow = '0 0 0.1em rgba(255, 255, 255, 1)';
    }
    setCodeEl.textContent = card.setCode;

    typeRow.appendChild(typeEl);
    typeRow.appendChild(setCodeEl);

    const textEl = document.createElement('div');
    textEl.className = 'card-text';
    // Remove parenthesized content from card text
    const cleanedText = card.text.replaceAll(/\([^)]*\)/g, '');
    textEl.appendChild(renderTextWithManaDots(cleanedText));

    if (card.flavorText) {
      textEl.appendChild(document.createElement('br'));
      const flavorSpan = document.createElement('i');
      flavorSpan.className = 'card-flavor-text';
      flavorSpan.innerHTML = card.flavorText.replaceAll('\n', '<br>');
      textEl.appendChild(flavorSpan);
    }

    body.appendChild(typeRow);
    body.appendChild(textEl);

    // Footer: number+artist (left) + power/toughness or loyalty (right)
    const footer = document.createElement('div');
    footer.className = 'card-footer';
    const leftInfo = document.createElement('span');
    leftInfo.className = 'card-left-info';
    leftInfo.textContent = card.number;
    if (card.artist) {
      leftInfo.textContent += ` — ${card.artist}`;
    }
    footer.appendChild(leftInfo);

    // Power/toughness for creatures, loyalty for planeswalkers
    if (card.hasPowerToughness) {
      const ptEl = document.createElement('span');
      ptEl.className = 'card-power-toughness';
      ptEl.textContent = card.powerToughness.display;
      footer.appendChild(ptEl);
    } else if (card.hasInitialLoyalty) {
      const loyaltyEl = document.createElement('span');
      loyaltyEl.className = 'card-initial-loyalty';
      loyaltyEl.textContent = card.initialLoyalty.value;
      footer.appendChild(loyaltyEl);
    }

    wrapper.appendChild(header);
    wrapper.appendChild(separator);
    wrapper.appendChild(body);
    wrapper.appendChild(footer);

    return wrapper;
  }
}