// SC-TCG — E2E Tests: Custom Card Sets
// Playwright BDD tests for Upload, Save, and Load custom card sets via localStorage
import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const TEST_DATA_DIR = path.join(__dirname, '..', '__data__');

// Helper: Create a dummy JSON file with the given number of cards
function createDummySetFile(cardCount: number): string {
  const cards: any[] = [];
  for (let i = 1; i <= cardCount; i++) {
    cards.push({
      id: `dummy-${i}`,
      name: `Test Card ${i}`,
      manaCost: '2UU',
      cardType: { value: 'Creature — Human Warrior' },
      powerToughness: '3/3',
      rarity: 'common',
      colors: ['W'],
      text: 'This is a test card.',
      setCode: 'SOS',
      number: `${i.toString().padStart(3, '0')}`,
    });
  }

  const filePath = path.join(TEST_DATA_DIR, `dummy-set-${cardCount}.json`);
  fs.mkdirSync(TEST_DATA_DIR, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(cards));
  return filePath;
}

test.describe('Custom Card Set Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  // Scenario Outline: Upload a JSON file and display cards
  test.describe('Upload a JSON file and display cards', () => {
    test('should upload 1 card and display it', async ({ page }) => {
      const filePath = createDummySetFile(1);
      await page.locator('#jsonUploadInput').setInputFiles(filePath);
      await expect(page.locator('#cardGrid')).toContainText('Test Card 1');
    });

    test('should upload 5 cards and display them', async ({ page }) => {
      const filePath = createDummySetFile(5);
      await page.locator('#jsonUploadInput').setInputFiles(filePath);
      await expect(page.locator('#cardGrid')).toContainText('Test Card 1');
      await expect(page.locator('#cardGrid')).toContainText('Test Card 2');
    });

    test('should upload 10 cards and display them', async ({ page }) => {
      const filePath = createDummySetFile(10);
      await page.locator('#jsonUploadInput').setInputFiles(filePath);
      await expect(page.locator('#cardGrid')).toContainText('Test Card 1');
      await expect(page.locator('#cardGrid')).toContainText('Test Card 10');
    });
  });

  // Scenario Outline: Save a custom set with a given name
  test.describe('Save a custom set with a given name', () => {
    test('should save 1 card as "My First Set"', async ({ page }) => {
      const filePath = createDummySetFile(1);
      await page.locator('#jsonUploadInput').setInputFiles(filePath);
      await page.click('#saveSetButton');
      await page.fill('input[type="text"]', 'My First Set');
      await page.press('input[type="text"]', 'Enter');
      const sets = await page.evaluate(() => {
        return JSON.parse(localStorage.getItem('sc-tcg-saved-sets') || '[]').map(s => s.name);
      });
      expect(sets).toContain('My First Set');
    });

    test('should save 5 cards as "Battle Deck"', async ({ page }) => {
      const filePath = createDummySetFile(5);
      await page.locator('#jsonUploadInput').setInputFiles(filePath);
      await page.click('#saveSetButton');
      await page.fill('input[type="text"]', 'Battle Deck');
      await page.press('input[type="text"]', 'Enter');
      const sets = await page.evaluate(() => {
        return JSON.parse(localStorage.getItem('sc-tcg-saved-sets') || '[]').map(s => s.name);
      });
      expect(sets).toContain('Battle Deck');
    });

    test('should save 10 cards as "Commander Deck"', async ({ page }) => {
      const filePath = createDummySetFile(10);
      await page.locator('#jsonUploadInput').setInputFiles(filePath);
      await page.click('#saveSetButton');
      await page.fill('input[type="text"]', 'Commander Deck');
      await page.press('input[type="text"]', 'Enter');
      const sets = await page.evaluate(() => {
        return JSON.parse(localStorage.getItem('sc-tcg-saved-sets') || '[]').map(s => s.name);
      });
      expect(sets).toContain('Commander Deck');
    });
  });

  // Scenario Outline: Load a saved set from the dropdown
  test.describe('Load a saved set from the dropdown', () => {
    test('should load "My First Set" and display 1 card', async ({ page }) => {
      const filePath = createDummySetFile(1);
      await page.locator('#jsonUploadInput').setInputFiles(filePath);
      await page.click('#saveSetButton');
      await page.fill('input[type="text"]', 'My First Set');
      await page.press('input[type="text"]', 'Enter');

      const sets = await page.locator('#setSelector option').allTextContents();
      expect(sets).toContain('My First Set');

      await page.selectOption('#setSelector', 'My First Set');
      await expect(page.locator('#cardGrid')).toContainText('Test Card 1');
    });

    test('should load "Battle Deck" and display 5 cards', async ({ page }) => {
      const filePath = createDummySetFile(5);
      await page.locator('#jsonUploadInput').setInputFiles(filePath);
      await page.click('#saveSetButton');
      await page.fill('input[type="text"]', 'Battle Deck');
      await page.press('input[type="text"]', 'Enter');

      const sets = await page.locator('#setSelector option').allTextContents();
      expect(sets).toContain('Battle Deck');

      await page.selectOption('#setSelector', 'Battle Deck');
      await expect(page.locator('#cardGrid')).toContainText('Test Card 1');
    });

    test('should load "Commander Deck" and display 10 cards', async ({ page }) => {
      const filePath = createDummySetFile(10);
      await page.locator('#jsonUploadInput').setInputFiles(filePath);
      await page.click('#saveSetButton');
      await page.fill('input[type="text"]', 'Commander Deck');
      await page.press('input[type="text"]', 'Enter');

      const sets = await page.locator('#setSelector option').allTextContents();
      expect(sets).toContain('Commander Deck');

      await page.selectOption('#setSelector', 'Commander Deck');
      await expect(page.locator('#cardGrid')).toContainText('Test Card 10');
    });
  });

  // Scenario Outline: Switch between saved sets
  test.describe('Switch between saved sets', () => {
    test('should switch from "Deck A" to "Deck B" and display correct cards', async ({ page }) => {
      const filePathA = createDummySetFile(3);
      await page.locator('#jsonUploadInput').setInputFiles(filePathA);
      await page.click('#saveSetButton');
      await page.fill('input[type="text"]', 'Deck A');
      await page.press('input[type="text"]', 'Enter');

      const filePathB = createDummySetFile(7);
      await page.locator('#jsonUploadInput').setInputFiles(filePathB);
      await page.click('#saveSetButton');
      await page.fill('input[type="text"]', 'Deck B');
      await page.press('input[type="text"]', 'Enter');

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
      const filePathA = createDummySetFile(5);
      await page.locator('#jsonUploadInput').setInputFiles(filePathA);
      await page.click('#saveSetButton');
      await page.fill('input[type="text"]', 'Red Deck');
      await page.press('input[type="text"]', 'Enter');

      const filePathB = createDummySetFile(8);
      await page.locator('#jsonUploadInput').setInputFiles(filePathB);
      await page.click('#saveSetButton');
      await page.fill('input[type="text"]', 'Blue Deck');
      await page.press('input[type="text"]', 'Enter');

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
      const filePathA = createDummySetFile(10);
      await page.locator('#jsonUploadInput').setInputFiles(filePathA);
      await page.click('#saveSetButton');
      await page.fill('input[type="text"]', 'Commander 1');
      await page.press('input[type="text"]', 'Enter');

      const filePathB = createDummySetFile(12);
      await page.locator('#jsonUploadInput').setInputFiles(filePathB);
      await page.click('#saveSetButton');
      await page.fill('input[type="text"]', 'Commander 2');
      await page.press('input[type="text"]', 'Enter');

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

  // Scenario: Clear all filters resets the view to full set
  test.describe('Clear all filters resets the view to full set', () => {
    test('should clear filters and display all cards in saved set', async ({ page }) => {
      const filePath = createDummySetFile(5);
      await page.locator('#jsonUploadInput').setInputFiles(filePath);
      await page.click('#saveSetButton');
      await page.fill('input[type="text"]', 'Test Set');
      await page.press('input[type="text"]', 'Enter');

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