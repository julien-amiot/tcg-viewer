// CardType value object
// Represents the type line of a Magic: The Gathering card
// Examples: "Creature — Human Wizard", "Instant", "Enchantment — Aura"

export class CardType {
  public readonly value: string;
  public readonly subtypes: string[];

  constructor(value: string, subtypes: string[] = []) {
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new Error('Card type must be a non-empty string');
    }
    this.value = value.trim();
    this.subtypes = subtypes.map(s => s.trim()).filter(s => s.length > 0);
  }

  static from(value: string, subtypes?: string[]): CardType {
    return new CardType(value, subtypes);
  }

  static creature(subtypes: string[]): CardType {
    return new CardType('Creature', subtypes);
  }

  static instant(): CardType {
    return new CardType('Instant');
  }

  static sorcery(): CardType {
    return new CardType('Sorcery');
  }

  static land(): CardType {
    return new CardType('Land');
  }

  isCreature(): boolean {
    return this.value === 'Creature';
  }

  isLand(): boolean {
    return this.value === 'Land';
  }

  isInstant(): boolean {
    return this.value === 'Instant';
  }

  isSorcery(): boolean {
    return this.value === 'Sorcery';
  }

  isEnchantment(): boolean {
    return this.value === 'Enchantment';
  }

  isArtifact(): boolean {
    return this.value === 'Artifact';
  }

  isPlanewalker(): boolean {
    return this.value === 'Planewalker';
  }
}
