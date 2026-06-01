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
  [key: string]: any;
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

  constructor(
    id: string,
    name: CardName,
    manaCost: ManaCost,
    cardType: CardType,
    powerToughness: PowerToughness,
    rarity: Rarity,
    colors: Color[],
    text: string,
    setCode: string,
    number: string
  ) {
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
  }

  static fromRaw(raw: RawCardData): Card {
    const colors = raw.colors.map(c => Color.from(c));
    const pt = (raw.power && raw.toughness)
      ? PowerToughness.from(`${raw.power}/${raw.toughness}`)
      : PowerToughness.empty();

    return new Card(
      raw.uuid,
      CardName.from(raw.name),
      ManaCost.from(raw.manaCost),
      CardType.from(raw.type, raw.subtypes),
      pt,
      Rarity.from(raw.rarity),
      colors,
      raw.text || '',
      raw.setCode,
      raw.number
    );
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
