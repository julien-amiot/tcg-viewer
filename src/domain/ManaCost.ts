// ManaCost value object
// Represents the mana cost of a Magic: The Gathering card
// Format examples: "2RR", "{3}{U}", "—", "0"

export class ManaCost {
  public readonly value: string;

  constructor(value: string) {
    if (typeof value !== 'string') {
      throw new Error('Mana cost must be a string');
    }
    this.value = value.trim();
  }

  static from(value: string): ManaCost {
    return new ManaCost(value);
  }

  static empty(): ManaCost {
    return new ManaCost('—');
  }

  get isEmpty(): boolean {
    return this.value === '—' || this.value === '';
  }
}
