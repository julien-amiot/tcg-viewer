// Card aggregate root
// Combines all value objects into a complete MTG card representation

import { CardName } from './CardName';
import { ManaCost } from './ManaCost';
import { CardType } from './CardType';
import { PowerToughness } from './PowerToughness';
import { Rarity } from './Rarity';
import { Color } from './Color';
import { InitialLoyalty } from './InitialLoyalty';

export interface RawCardData {
  uuid: string;
  name: string;
  manaCost: string;
  type: string;
  text: string;
  power?: string;
  toughness?: string;
  loyalty?: string;
  rarity: string;
  colors: string[];
  subtypes: string[];
  setCode: string;
  number: string;
  artist?: string;
  flavorText?: string;
  faceName?: string;
  imageUrl?: string;
  layout?: string;
  supertypes?: string[];
  types?: string[];
  frameVersion?: string;
  [key: string]: any;
}

export interface CardOptions {
  id: string;
  name: CardName;
  manaCost: ManaCost;
  cardType: CardType;
  powerToughness: PowerToughness;
  initialLoyalty: InitialLoyalty;
  rarity: Rarity;
  colors: Color[];
  text: string;
  setCode: string;
  number: string;
  artist?: string;
  flavorText?: string;
  faceName?: string;
  imageUrl?: string;
  layout?: string;
  supertypes?: string[];
  types?: string[];
  frameVersion?: string;
}

export class Card {
  public readonly id: string;
  public readonly name: CardName;
  public readonly manaCost: ManaCost;
  public readonly cardType: CardType;
  public readonly powerToughness: PowerToughness;
  public readonly initialLoyalty: InitialLoyalty;
  public readonly rarity: Rarity;
  public readonly colors: Color[];
  public readonly text: string;
  public readonly setCode: string;
  public readonly number: string;
  public readonly artist?: string;
  public readonly flavorText?: string;
  public readonly faceName?: string;
  public readonly imageUrl?: string;
  public readonly layout?: string;
  public readonly supertypes: string[];
  public readonly types: string[];
  public readonly frameVersion?: string;

  constructor({ id, name, manaCost, cardType, powerToughness, initialLoyalty, rarity, colors, text, setCode, number, artist, flavorText, faceName, imageUrl, layout, supertypes, types, frameVersion }: CardOptions) {
    this.id = id;
    this.name = name;
    this.manaCost = manaCost;
    this.cardType = cardType;
    this.powerToughness = powerToughness;
    this.initialLoyalty = initialLoyalty;
    this.rarity = rarity;
    this.colors = colors;
    this.text = text;
    this.setCode = setCode;
    this.number = number;
    this.artist = artist;
    this.flavorText = flavorText;
    this.faceName = faceName;
    this.imageUrl = imageUrl;
    this.layout = layout;
    this.supertypes = supertypes || [];
    this.types = types || [];
    this.frameVersion = frameVersion;
  }

  static fromRaw(raw: RawCardData): Card {
    const colors = raw.colors.map(c => Color.from(c));
    const pt = (raw.power && raw.toughness)
      ? PowerToughness.from(`${raw.power}/${raw.toughness}`)
      : PowerToughness.empty();

    const loyalty = InitialLoyalty.from(raw.loyalty);

    return new Card({
      id: raw.uuid,
      name: CardName.from(raw.name),
      manaCost: ManaCost.from(raw.manaCost),
      cardType: CardType.from(raw.type, raw.subtypes),
      powerToughness: pt,
      initialLoyalty: loyalty,
      rarity: Rarity.from(raw.rarity),
      colors,
      text: raw.text || '',
      setCode: raw.setCode,
      number: raw.number,
      artist: raw.artist,
      flavorText: raw.flavorText,
      faceName: raw.faceName,
      imageUrl: raw.imageUrl,
      layout: raw.layout,
      supertypes: raw.supertypes || [],
      types: raw.types || [raw.cardType.value],
      frameVersion: raw.frameVersion
    });
  }

  get hasPowerToughness(): boolean {
    return !this.powerToughness.isEmpty;
  }

  get hasInitialLoyalty(): boolean {
    return !this.initialLoyalty.isEmpty;
  }

  get isCreature(): boolean {
    return this.cardType.isCreature();
  }

  get isLand(): boolean {
    return this.cardType.isLand();
  }

  containsColor(color: Color): boolean {
    return this.colors.some(c => c.value === color.value);
  }

  matchesName(query: string): boolean {
    const q = query.toLowerCase().trim();
    return this.name.value.toLowerCase().includes(q);
  }

  // CSS class helpers for design system
  get cssLayout(): string {
    if (!this.layout) return 'layout--normal';
    return `layout--${this.layout}`;
  }

  get cssTypes(): string[] {
    // Use the types array, normalize to CSS-safe class names
    return (this.types || []).map(t => `type--${t.toLowerCase()}`);
  }

  get cssSupertypes(): string[] {
    return (this.supertypes || []).map(s => `supertype--${s.toLowerCase()}`);
  }

  get cssFrameVersion(): string {
    return this.frameVersion ? `frame--${this.frameVersion}` : '';
  }

  get cssColorIdentity(): string {
    const colors = this.colors.map(c => c.value);
    if (colors.length === 0) return 'color-identity--none';
    if (colors.length === 1) return `color-identity--${colors[0]}`;
    const sorted = [...colors].sort();
    if (colors.length === 2) return `color-identity--${sorted.join('')}`;
    if (colors.length === 3) return `color-identity--${sorted.join('')}`;
    if (colors.length === 4) return 'color-identity--gold';
    return 'color-identity--gold'; // 5-color
  }

  get cssRarity(): string {
    return `rarity--${this.rarity.value}`;
  }
}
