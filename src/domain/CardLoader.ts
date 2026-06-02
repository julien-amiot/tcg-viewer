// CardLoader - loads card data from JSON and maps to domain models
import { Card, RawCardData } from './Card';

interface CardJsonResponse {
  data: {
    cards: Record<string, RawCardData>;
  };
}

export class CardLoader {
  private static instance: CardLoader | null = null;
  private readonly cards: Card[] = [];
  private loaded = false;

  private constructor() {}

  static getInstance(): CardLoader {
    CardLoader.instance ??= new CardLoader();
    return CardLoader.instance;
  }

  async load(path: string = 'CARDS/SOS_prepared.json'): Promise<void> {
    if (this.loaded) return;

    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to load cards from ${path}: ${response.statusText}`);
    }

    const json: CardJsonResponse = await response.json();
    this.cards.length = 0;

    for (const key of Object.keys(json.data.cards)) {
      const raw = json.data.cards[key];
      try {
        this.cards.push(Card.fromRaw(raw));
      } catch (e) {
        console.warn(`Skipping card ${key}: ${e}`);
      }
    }

    this.loaded = true;
  }

  async loadFromJson(jsonData: string): Promise<void> {
    if (this.loaded) {
      console.warn('CardLoader already loaded; clearing existing cards before loading new data.');
      this.cards.length = 0;
    }

    try {
      const parsed = JSON.parse(jsonData);
      for (const key of Object.keys(parsed)) {
        const raw = parsed[key];
        try {
          this.cards.push(Card.fromRaw(raw));
        } catch (e) {
          console.warn(`Skipping card ${key}: ${e}`);
        }
      }
    } catch (err) {
      throw new Error(`Failed to parse JSON: ${(err as Error).message}`);
    }
  }

  getAll(): Card[] {
    return [...this.cards];
  }

  get count(): number {
    return this.cards.length;
  }

  isLoaded(): boolean {
    return this.loaded;
  }
}
