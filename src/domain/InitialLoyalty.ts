// InitialLoyalty value object
// Represents starting loyalty of a planeswalker card
// Format: "3", "4", "*" (for *loyalty)

export class InitialLoyalty {
  public readonly value: string;

  constructor(value: string) {
    this.value = value.trim();
  }

  static from(input?: string): InitialLoyalty {
    if (!input || input.trim().length === 0) {
      return InitialLoyalty.empty();
    }
    return new InitialLoyalty(input);
  }

  static empty(): InitialLoyalty {
    return new InitialLoyalty('—');
  }

  get isEmpty(): boolean {
    return this.value === '—';
  }

  get display(): string {
    if (this.isEmpty) return '';
    return this.value;
  }
}