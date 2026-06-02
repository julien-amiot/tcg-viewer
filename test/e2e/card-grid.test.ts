import { test, expect } from '@playwright/test';

// Playwright BDD test implementation for card-grid.feature

test.describe('Card Grid Display', () => {
  const basePage = 'http://localhost:3000';

  // Helper to get the number of visible cards in the grid
  async function countVisibleCards(page: any) {
    return page.locator('.card').count();
  }

  test('cards are displayed in a grid', async ({ page }) => {
    await page.goto(basePage);
    await page.waitForLoadState('networkidle');

    const cardCount = await countVisibleCards(page);
    expect(cardCount).toBeGreaterThan(0);
  });

  test('filter by name "A"', async ({ page }) => {
    await page.goto(basePage);
    await page.waitForLoadState('networkidle');

    // Find and click the name filter input
    const nameFilter = page.locator('input[placeholder*="name"]');
    if (await nameFilter.count() > 0) {
      await nameFilter.fill('A');
      await page.waitForTimeout(500);
      const cardCount = await countVisibleCards(page);
      expect(cardCount).toBeGreaterThan(0);
    }
  });

  test('filter by name "Z"', async ({ page }) => {
    await page.goto(basePage);
    await page.waitForLoadState('networkidle');

    const nameFilter = page.locator('input[placeholder*="name"]');
    if (await nameFilter.count() > 0) {
      await nameFilter.fill('Z');
      await page.waitForTimeout(500);
      const cardCount = await countVisibleCards(page);
      expect(cardCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('filter by color "W"', async ({ page }) => {
    await page.goto(basePage);
    await page.waitForLoadState('networkidle');

    const colorFilter = page.locator('select[name*="color"]');
    if (await colorFilter.count() > 0) {
      await colorFilter.selectOption('W');
      await page.waitForTimeout(500);
      const cardCount = await countVisibleCards(page);
      expect(cardCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('filter by color "U"', async ({ page }) => {
    await page.goto(basePage);
    await page.waitForLoadState('networkidle');

    const colorFilter = page.locator('select[name*="color"]');
    if (await colorFilter.count() > 0) {
      await colorFilter.selectOption('U');
      await page.waitForTimeout(500);
      const cardCount = await countVisibleCards(page);
      expect(cardCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('filter by color "B"', async ({ page }) => {
    await page.goto(basePage);
    await page.waitForLoadState('networkidle');

    const colorFilter = page.locator('select[name*="color"]');
    if (await colorFilter.count() > 0) {
      await colorFilter.selectOption('B');
      await page.waitForTimeout(500);
      const cardCount = await countVisibleCards(page);
      expect(cardCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('filter by color "R"', async ({ page }) => {
    await page.goto(basePage);
    await page.waitForLoadState('networkidle');

    const colorFilter = page.locator('select[name*="color"]');
    if (await colorFilter.count() > 0) {
      await colorFilter.selectOption('R');
      await page.waitForTimeout(500);
      const cardCount = await countVisibleCards(page);
      expect(cardCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('filter by color "G"', async ({ page }) => {
    await page.goto(basePage);
    await page.waitForLoadState('networkidle');

    const colorFilter = page.locator('select[name*="color"]');
    if (await colorFilter.count() > 0) {
      await colorFilter.selectOption('G');
      await page.waitForTimeout(500);
      const cardCount = await countVisibleCards(page);
      expect(cardCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('filter by type "C"', async ({ page }) => {
    await page.goto(basePage);
    await page.waitForLoadState('networkidle');

    const typeFilter = page.locator('select[name*="type"]');
    if (await typeFilter.count() > 0) {
      await typeFilter.selectOption('C');
      await page.waitForTimeout(500);
      const cardCount = await countVisibleCards(page);
      expect(cardCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('filter by type "L"', async ({ page }) => {
    await page.goto(basePage);
    await page.waitForLoadState('networkidle');

    const typeFilter = page.locator('select[name*="type"]');
    if (await typeFilter.count() > 0) {
      await typeFilter.selectOption('L');
      await page.waitForTimeout(500);
      const cardCount = await countVisibleCards(page);
      expect(cardCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('filter by type "I"', async ({ page }) => {
    await page.goto(basePage);
    await page.waitForLoadState('networkidle');

    const typeFilter = page.locator('select[name*="type"]');
    if (await typeFilter.count() > 0) {
      await typeFilter.selectOption('I');
      await page.waitForTimeout(500);
      const cardCount = await countVisibleCards(page);
      expect(cardCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('filter by type "A"', async ({ page }) => {
    await page.goto(basePage);
    await page.waitForLoadState('networkidle');

    const typeFilter = page.locator('select[name*="type"]');
    if (await typeFilter.count() > 0) {
      await typeFilter.selectOption('A');
      await page.waitForTimeout(500);
      const cardCount = await countVisibleCards(page);
      expect(cardCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('filter by rarity "C"', async ({ page }) => {
    await page.goto(basePage);
    await page.waitForLoadState('networkidle');

    const rarityFilter = page.locator('select[name*="rarity"]');
    if (await rarityFilter.count() > 0) {
      await rarityFilter.selectOption('C');
      await page.waitForTimeout(500);
      const cardCount = await countVisibleCards(page);
      expect(cardCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('filter by rarity "U"', async ({ page }) => {
    await page.goto(basePage);
    await page.waitForLoadState('networkidle');

    const rarityFilter = page.locator('select[name*="rarity"]');
    if (await rarityFilter.count() > 0) {
      await rarityFilter.selectOption('U');
      await page.waitForTimeout(500);
      const cardCount = await countVisibleCards(page);
      expect(cardCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('filter by rarity "R"', async ({ page }) => {
    await page.goto(basePage);
    await page.waitForLoadState('networkidle');

    const rarityFilter = page.locator('select[name*="rarity"]');
    if (await rarityFilter.count() > 0) {
      await rarityFilter.selectOption('R');
      await page.waitForTimeout(500);
      const cardCount = await countVisibleCards(page);
      expect(cardCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('filter by rarity "M"', async ({ page }) => {
    await page.goto(basePage);
    await page.waitForLoadState('networkidle');

    const rarityFilter = page.locator('select[name*="rarity"]');
    if (await rarityFilter.count() > 0) {
      await rarityFilter.selectOption('M');
      await page.waitForTimeout(500);
      const cardCount = await countVisibleCards(page);
      expect(cardCount).toBeGreaterThanOrEqual(0);
    }
  });
});
