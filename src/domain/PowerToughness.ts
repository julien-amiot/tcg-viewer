// PowerToughness value object
// Represents power/toughness of a creature card
// Format: "2/2", "*/*", "—/—", "0/0"

export class PowerToughness {
  public readonly power: string;
  public readonly toughness: string;

  constructor(power: string, toughness: string) {
    this.power = power.trim();
    this.toughness = toughness.trim();
  }

  static from(value: string): PowerToughness {
    if (typeof value !== 'string' || value.trim().length === 0) {
      return PowerToughness.empty();
    }

    const parts = value.split('/');
    if (parts.length === 2) {
      return new PowerToughness(parts[0], parts[1]);
    }

    return PowerToughness.empty();
  }

  static empty(): PowerToughness {
    return new PowerToughness('—', '—');
  }

  get isEmpty(): boolean {
    return this.power === '—' || this.toughness === '—';
  }

  get display(): string {
    if (this.isEmpty) return '';
    return `${this.power}/${this.toughness}`;
  }
}
