const validColors = ['W', 'U', 'B', 'R', 'G'] as const;
type ColorLiteral = typeof validColors[number];

export class Color {
  public readonly value: ColorLiteral;

  constructor(value: ColorLiteral) {
    this.value = value;
  }

  static from(value: string): Color {
    if (!validColors.includes(value as ColorLiteral)) {
      throw new Error(`Invalid color: ${value}`);
    }
    return new Color(value as ColorLiteral);
  }
}