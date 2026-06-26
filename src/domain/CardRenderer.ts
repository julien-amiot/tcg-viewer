// CardRenderer - renders Card domain objects to DOM elements
// Uses CSS class composition for all styling; no inline styles for layout/appearance.
import { Card } from './Card';

// Mana color map for CSS class suffixes
const manaColorMap: Record<string, string> = {
  W: 'W',
  U: 'U',
  B: 'B',
  R: 'R',
  G: 'G',
};

function createManaDot(content: string, colorClass?: string): HTMLElement {
  const dot = document.createElement('span');
  dot.className = 'mana-dot';
  if (/^\d+$/.test(content) || content === 'X' || content === 'T') {
    dot.textContent = content;
  }
  if (colorClass) {
    dot.classList.add(`mana-dot--${colorClass}`);
  }
  return dot;
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

function renderManaToken(inner: string): HTMLElement {
  if (inner.includes('/')) {
    const sortedParts = inner.split('/').toSorted((a, b) => a.localeCompare(b));
    const key = sortedParts.join('');
    return createManaDot(inner, key);
  }
  if (manaColorMap[inner]) {
    return createManaDot(inner, manaColorMap[inner]);
  }
  // Numbers, X, T, or generic - pale grey
  return createManaDot(inner, 'generic');
}

function parseManaCost(raw: string): Array<{ content: string; colorClass?: string }> {
  const tokens: Array<{ content: string; colorClass?: string }> = [];
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
          tokens.push({ content: inner, colorClass: key });
        } else if (manaColorMap[inner]) {
          tokens.push({ content: inner, colorClass: manaColorMap[inner] });
        } else {
          // Number or generic - pale grey
          tokens.push({ content: inner, colorClass: 'generic' });
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

  constructor(gridId?: string | '') {
    // If gridId is undefined, default to 'cardGrid'.
    // If gridId is empty string, skip grid (used by showcase).
    // If gridId is a non-empty string, use it (throw if not found).
    if (gridId === '') {
      this.grid = null;
    } else if (gridId) {
      this.grid = document.getElementById(gridId);
      if (!this.grid) {
        throw new Error(`Card grid element '#${gridId}' not found`);
      }
    } else {
      this.grid = document.getElementById('cardGrid');
      if (!this.grid) {
        throw new Error("Card grid element '#cardGrid' not found");
      }
    }
  }

  render(cards: Card[]): void {
    if (!this.grid) return;
    this.grid.innerHTML = '';
    for (const card of cards) {
      this.grid.appendChild(this.createCardElement(card));
    }
  }

  /** Create a card element without adding it to the grid (used by showcase). */
  createCardElement(card: Card): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.dataset.cardId = card.id;

    // Build class list from card CSS properties
    const classes = ['card', card.cssLayout];
    classes.push(...card.cssTypes);
    classes.push(...card.cssSupertypes);
    if (card.cssFrameVersion) classes.push(card.cssFrameVersion);
    classes.push(card.cssColorIdentity);
    classes.push(card.cssRarity);

    // Add has-image modifier when card has an image URL.
    // backgroundImage must remain inline because the URL is dynamic.
    // The .card--has-image class handles structural styling (overlay, z-index).
    if (card.imageUrl) {
      classes.push('card--has-image');
      wrapper.style.backgroundImage = `url('${card.imageUrl}')`;
    }

    wrapper.className = classes.join(' ');

    // Header: name + mana cost dots
    const header = document.createElement('div');
    header.className = 'card-header';

    const nameEl = document.createElement('span');
    nameEl.className = 'card-name';
    const displayName = card.faceName ? card.faceName : card.name.value;
    nameEl.textContent = displayName;

    const manaContainer = document.createElement('span');
    manaContainer.className = 'card-mana-dots';
    const tokens = parseManaCost(card.manaCost.value);
    for (const token of tokens) {
      const dot = document.createElement('span');
      dot.className = 'mana-dot mana-dot--title';
      // Show numbers and X (generic mana variable), hide color letters
      if (/^\d+$/.test(token.content) || token.content === 'X') {
        dot.textContent = token.content;
      }
      if (token.colorClass) {
        dot.classList.add(`mana-dot--${token.colorClass}`);
      }
      manaContainer.appendChild(dot);
    }

    header.appendChild(nameEl);
    header.appendChild(manaContainer);

    // Separator between header and body (image area)
    const separator = document.createElement('div');
    separator.className = 'card-separator';

    // Spacer to push footer + text block below separator
    const spacer = document.createElement('div');
    spacer.className = 'card-spacer';

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
    wrapper.appendChild(spacer);
    wrapper.appendChild(body);
    wrapper.appendChild(footer);

    return wrapper;
  }
}