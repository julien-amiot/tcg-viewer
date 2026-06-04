// Rarity value object
// Represents the rarity of a Magic: The Gathering card

const validRarities = ['common', 'uncommon', 'rare', 'mythic'] as const;
type RarityLiteral = typeof validRarities[number];

export class Rarity {
  public readonly value: RarityLiteral;

  constructor(value: RarityLiteral) {
    this.value = value;
  }

  static from(value: string): Rarity {
    const normalized = value.toLowerCase().trim() as RarityLiteral;
    if (!validRarities.includes(normalized)) {
      throw new Error(`Invalid rarity: ${value}. Must be one of: ${validRarities.join(', ')}`);
    }
    return new Rarity(normalized);
  }

  static common(): Rarity {
    return new Rarity('common');
  }

  static uncommon(): Rarity {
    return new Rarity('uncommon');
  }

  static rare(): Rarity {
    return new Rarity('rare');
  }

  static mythic(): Rarity {
    return new Rarity('mythic');
  }

  get isCommon(): boolean {
    return this.value === 'common';
  }

  get isUncommon(): boolean {
    return this.value === 'uncommon';
  }

  get isRare(): boolean {
    return this.value === 'rare';
  }

  get isMythic(): boolean {
    return this.value === 'mythic';
  }

  get colorCode(): string {
    switch (this.value) {
      case 'common': return '#808080';
      case 'uncommon': return '#C0C0C0';
      case 'rare': return '#FFD700';
      case 'mythic': return '#9b59b6';
      default: return '#000000';
    }
  }
}
