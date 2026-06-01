// CardName value object
// Represents the name of a Magic: The Gathering card

export class CardName {
  public readonly value: string;

  constructor(value: string) {
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new Error('Card name must be a non-empty string');
    }
    this.value = value.trim();
  }

  static from(value: string): CardName {
    return new CardName(value);
  }
}
