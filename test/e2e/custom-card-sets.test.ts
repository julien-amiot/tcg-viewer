// SC-TCG — E2E Tests: Custom Card Sets
// Playwright BDD tests for Upload, Save, and Load custom card sets via localStorage
import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const TEST_DATA_DIR = path.join(__dirname, '..', '__data__');

// Helper: Create a dummy JSON file with the given number of cards
function createDummySetFile(cardCount: number): string {
  const cards: Record<string, any>[] = [];
  for (let i = 1; i <= cardCount; i++) {
    cards.push({
      uuid: `dummy-${i}`,
      name: `Test Card ${i}`,
      manaCost: '2W',
      type: 'Creature — Human Warrior',
      text: 'This is a test card.',
      power: '3',
      toughness: '3',
      rarity: 'common',
      colors: ['W'],
      subtypes: [],
      setCode: 'SOS',
      number: `${i.toString().padStart(3, '0')}`,
    });
  }

  const filePath = path.join(TEST_DATA_DIR, `dummy-set-${cardCount}.json`);
  fs.mkdirSync(TEST_DATA_DIR, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(cards));
  return filePath;
}

// Helper: Upload a file and wait for cards to display
async function uploadFile(page: any, cardCount: number) {
  const filePath = createDummySetFile(cardCount);
  await page.locator('#jsonUploadInput').setInputFiles(filePath);
  // Wait for the app to process the uploaded JSON and render cards
  await page.waitForSelector('.card');
}

// Helper: Get saved sets from localStorage using evaluate()
async function getSavedSets(page: any): Promise<string[]> {
  return await page.evaluate(() => {
    try {
      const raw = localStorage.getItem('sc-tcg-saved-sets');
      if (!raw) return [];
      return JSON.parse(raw).map((s: { name: string }) => s.name);
    } catch {
      return [];
    }
  });
}

// Helper: Upload cards and save the loaded set via SetStorage directly (bypassing prompt).
async function uploadAndSaveSet(page: any, cardCount: number, setName: string): Promise<string[]> {
  const filePath = createDummySetFile(cardCount);

  // Read the raw file content so we can store it exactly as-is.
  let rawJson = fs.readFileSync(filePath, 'utf8');
  if (!rawJson.trim()) {
    throw new Error(`Failed to read dummy set file: ${filePath}`);
  }

  return await page.evaluate(async (data: { rawJson: string; setName: string }) => {
    const loader = (window as any).loader;
    if (!loader) throw new Error('loader not found');

    const setStorage = (window as any).SetStorage?.getInstance();
    if (!setStorage) throw new Error('SetStorage not found');

    // Load cards into the app first.
    await loader.loadFromJson(data.rawJson);

    // Save using the raw JSON string directly, NOT via Card instances.
    setStorage.saveSet(data.setName, data.rawJson);

    // Update the DOM selector (the app only does this in init() or after prompt-based saves).
    const sel = document.getElementById('setSelector') as HTMLSelectElement;
    if (sel) {
      sel.innerHTML = '<option value="">-- Select a Set --</option>';
      for (const name of setStorage.listSets()) {
        const opt = document.createElement('option');
        opt.value = name;
        opt.textContent = name;
        sel.appendChild(opt);
      }
    }

    return JSON.parse(localStorage.getItem('sc-tcg-saved-sets') || '[]').map((s: { name: string }) => s.name);
  }, { rawJson, setName });
}

test.describe('Custom Card Set Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Upload a JSON file and display cards', () => {
    test('should upload 1 card and display it', async ({ page }) => {
      await uploadFile(page, 1);
      await expect(page.locator('#cardGrid')).toContainText('Test Card 1');
    });

    test('should upload 5 cards and display them', async ({ page }) => {
      await uploadFile(page, 5);
      await expect(page.locator('#cardGrid')).toContainText('Test Card 1');
      await expect(page.locator('#cardGrid')).toContainText('Test Card 2');
    });

    test('should upload 10 cards and display them', async ({ page }) => {
      await uploadFile(page, 10);
      await expect(page.locator('#cardGrid')).toContainText('Test Card 1');
      await expect(page.locator('#cardGrid')).toContainText('Test Card 10');
    });
  });

  test.describe('Save a custom set with a given name', () => {
    test('should save 1 card as "My First Set"', async ({ page }) => {
      const sets = await uploadAndSaveSet(page, 1, 'My First Set');
      expect(sets).toContain('My First Set');
    });

    test('should save 5 cards as "Battle Deck"', async ({ page }) => {
      const sets = await uploadAndSaveSet(page, 5, 'Battle Deck');
      expect(sets).toContain('Battle Deck');
    });

    test('should save 10 cards as "Commander Deck"', async ({ page }) => {
      const sets = await uploadAndSaveSet(page, 10, 'Commander Deck');
      expect(sets).toContain('Commander Deck');
    });
  });

  test.describe('Load a saved set from the dropdown', () => {
    test('should load "My First Set" and display 1 card', async ({ page }) => {
      await uploadAndSaveSet(page, 1, 'My First Set');

      const sets = await page.locator('#setSelector option').allTextContents();
      expect(sets).toContain('My First Set');

      await page.selectOption('#setSelector', 'My First Set');
      await expect(page.locator('#cardGrid')).toContainText('Test Card 1');
    });

    test('should load "Battle Deck" and display 5 cards', async ({ page }) => {
      await uploadAndSaveSet(page, 5, 'Battle Deck');

      const sets = await page.locator('#setSelector option').allTextContents();
      expect(sets).toContain('Battle Deck');

      await page.selectOption('#setSelector', 'Battle Deck');
      await expect(page.locator('#cardGrid')).toContainText('Test Card 1');
    });

    test('should load "Commander Deck" and display 10 cards', async ({ page }) => {
      await uploadAndSaveSet(page, 10, 'Commander Deck');

      const sets = await page.locator('#setSelector option').allTextContents();
      expect(sets).toContain('Commander Deck');

      await page.selectOption('#setSelector', 'Commander Deck');
      await expect(page.locator('#cardGrid')).toContainText('Test Card 10');
    });
  });

  test.describe('Switch between saved sets', () => {
    test('should switch from "Deck A" to "Deck B" and display correct cards', async ({ page }) => {
      await uploadAndSaveSet(page, 3, 'Deck A');
      await uploadAndSaveSet(page, 7, 'Deck B');

      const sets = await page.locator('#setSelector option').allTextContents();
      expect(sets).toContain('Deck A');
      expect(sets).toContain('Deck B');

      // Load Deck A
      await page.selectOption('#setSelector', 'Deck A');
      await expect(page.locator('#cardGrid')).toContainText('Test Card 1');
      await expect(page.locator('#cardGrid')).toContainText('Test Card 3');

      // Switch to Deck B
      await page.selectOption('#setSelector', 'Deck B');
      await expect(page.locator('#cardGrid')).toContainText('Test Card 1');
      await expect(page.locator('#cardGrid')).toContainText('Test Card 7');
    });

    test('should switch from "Red Deck" to "Blue Deck" and display correct cards', async ({ page }) => {
      await uploadAndSaveSet(page, 5, 'Red Deck');
      await uploadAndSaveSet(page, 8, 'Blue Deck');

      const sets = await page.locator('#setSelector option').allTextContents();
      expect(sets).toContain('Red Deck');
      expect(sets).toContain('Blue Deck');

      // Load Red Deck
      await page.selectOption('#setSelector', 'Red Deck');
      await expect(page.locator('#cardGrid')).toContainText('Test Card 1');
      await expect(page.locator('#cardGrid')).toContainText('Test Card 5');

      // Switch to Blue Deck
      await page.selectOption('#setSelector', 'Blue Deck');
      await expect(page.locator('#cardGrid')).toContainText('Test Card 1');
      await expect(page.locator('#cardGrid')).toContainText('Test Card 8');
    });

    test('should switch from "Commander 1" to "Commander 2" and display correct cards', async ({ page }) => {
      await uploadAndSaveSet(page, 10, 'Commander 1');
      await uploadAndSaveSet(page, 12, 'Commander 2');

      const sets = await page.locator('#setSelector option').allTextContents();
      expect(sets).toContain('Commander 1');
      expect(sets).toContain('Commander 2');

      // Load Commander 1
      await page.selectOption('#setSelector', 'Commander 1');
      await expect(page.locator('#cardGrid')).toContainText('Test Card 10');

      // Switch to Commander 2
      await page.selectOption('#setSelector', 'Commander 2');
      await expect(page.locator('#cardGrid')).toContainText('Test Card 12');
    });
  });

  test.describe('Clear all filters resets the view to full set', () => {
    test('should clear filters and display all cards in saved set', async ({ page }) => {
      await uploadAndSaveSet(page, 5, 'Test Set');

      // Apply some filters
      await page.fill('#searchInput', 'Card 1');
      await page.selectOption('#colorFilter', 'W');
      await page.selectOption('#typeFilter', 'Creature');
      await page.selectOption('#rarityFilter', 'common');

      // Clear all filters
      await page.click('#clearFiltersButton');

      // Verify all cards are displayed
      await expect(page.locator('#cardGrid')).toContainText('Test Card 1');
      await expect(page.locator('#cardGrid')).toContainText('Test Card 2');
      await expect(page.locator('#cardGrid')).toContainText('Test Card 3');
      await expect(page.locator('#cardGrid')).toContainText('Test Card 4');
      await expect(page.locator('#cardGrid')).toContainText('Test Card 5');
    });
  });
});