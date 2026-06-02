// SC-TCG — Custom Card Set Storage
// Encapsulates localStorage operations for user-uploaded card sets.

export interface SavedSet {
  name: string;
  data: string; // JSON string of cards
}

/**
 * Singleton SetStorage manages saving/loading custom card sets to localStorage.
 */
export class SetStorage {
  private static readonly STORAGE_KEY = 'sc-tcg-saved-sets';
  private static instance: SetStorage | null = null;

  private constructor() {}

  public static getInstance(): SetStorage {
    if (!SetStorage.instance) {
      SetStorage.instance = new SetStorage();
    }
    return SetStorage.instance;
  }

  /** Save a set with the given name and card data. */
  public saveSet(name: string, data: string): void {
    const sets = this.getSets();
    // Remove existing entry if present to avoid duplicates.
    const idx = sets.findIndex((s) => s.name === name);
    if (idx !== -1) {
      sets.splice(idx, 1);
    }
    sets.push({ name, data });
    localStorage.setItem(SetStorage.STORAGE_KEY, JSON.stringify(sets));
  }

  /** Load a set by name. Returns null if not found. */
  public loadSet(name: string): string | null {
    const sets = this.getSets();
    return sets.find((s) => s.name === name)?.data ?? null;
  }

  /** List all saved set names. */
  public listSets(): string[] {
    const sets = this.getSets();
    return sets.map((s) => s.name);
  }

  /** Delete a set by name. */
  public deleteSet(name: string): void {
    const sets = this.getSets().filter((s) => s.name !== name);
    localStorage.setItem(SetStorage.STORAGE_KEY, JSON.stringify(sets));
  }

  private getSets(): SavedSet[] {
    try {
      const raw = localStorage.getItem(SetStorage.STORAGE_KEY);
      return raw ? (JSON.parse(raw) as SavedSet[]) : [];
    } catch {
      return [];
    }
  }
}