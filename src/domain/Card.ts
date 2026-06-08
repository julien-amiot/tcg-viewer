// Card aggregate root
// Combines all value objects into a complete MTG card representation

import { CardName } from './CardName';
import { ManaCost } from './ManaCost';
import { CardType } from './CardType';
import { PowerToughness } from './PowerToughness';
import { Rarity } from './Rarity';
import { Color } from './Color';

export interface RawCardData {
  uuid: string;
  name: string;
  manaCost: string;
  type: string;
  text: string;
  power?: string;
  toughness?: string;
  rarity: string;
  colors: string[];
  subtypes: string[];
  setCode: string;
  number: string;
  artist?: string;
  flavorText?: string;
  faceName?: string;
  imageUrl?: string;
  [key: string]: any;
}

export interface CardOptions {
  id: string;
  name: CardName;
  manaCost: ManaCost;
  cardType: CardType;
  powerToughness: PowerToughness;
  rarity: Rarity;
  colors: Color[];
  text: string;
  setCode: string;
  number: string;
  artist?: string;
  flavorText?: string;
  faceName?: string;
  imageUrl?: string;
}

export class Card {
  public readonly id: string;
  public readonly name: CardName;
  public readonly manaCost: ManaCost;
  public readonly cardType: CardType;
  public readonly powerToughness: PowerToughness;
  public readonly rarity: Rarity;
  public readonly colors: Color[];
  public readonly text: string;
  public readonly setCode: string;
  public readonly number: string;
  public readonly artist?: string;
  public readonly flavorText?: string;
  public readonly faceName?: string;
  public readonly imageUrl?: string;

  constructor({ id, name, manaCost, cardType, powerToughness, rarity, colors, text, setCode, number, artist, flavorText, faceName, imageUrl }: CardOptions) {
    this.id = id;
    this.name = name;
    this.manaCost = manaCost;
    this.cardType = cardType;
    this.powerToughness = powerToughness;
    this.rarity = rarity;
    this.colors = colors;
    this.text = text;
    this.setCode = setCode;
    this.number = number;
    this.artist = artist;
    this.flavorText = flavorText;
    this.faceName = faceName;
    this.imageUrl = imageUrl;
  }

  static fromRaw(raw: RawCardData): Card {
    const colors = raw.colors.map(c => Color.from(c));
    const pt = (raw.power && raw.toughness)
      ? PowerToughness.from(`${raw.power}/${raw.toughness}`)
      : PowerToughness.empty();

    return new Card({
      id: raw.uuid,
      name: CardName.from(raw.name),
      manaCost: ManaCost.from(raw.manaCost),
      cardType: CardType.from(raw.type, raw.subtypes),
      powerToughness: pt,
      rarity: Rarity.from(raw.rarity),
      colors,
      text: raw.text || '',
      setCode: raw.setCode,
      number: raw.number,
      artist: raw.artist,
      flavorText: raw.flavorText,
      faceName: raw.faceName,
      imageUrl: raw.imageUrl
    });
  }

  get hasPowerToughness(): boolean {
    return !this.powerToughness.isEmpty;
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
}