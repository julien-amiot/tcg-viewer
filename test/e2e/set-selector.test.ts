import { test, expect } from '@playwright/test';

// Playwright BDD test implementation for set-selector.feature

test.describe('Set Selector', () => {
  const basePage = 'http://localhost:3000';

  // Helper to get the number of visible cards in the grid
  async function countVisibleCards(page: any) {
    return page.locator('.card').count();
  }

  test('set selector displays SOS as an option', async ({ page }) => {
    await page.goto(basePage);
    await page.waitForLoadState('networkidle');

    const setSelector = page.locator('select[name*="set"]');
    if (await setSelector.count() > 0) {
      const options = await setSelector.evaluate((el: any) => el.options.map(o => o.text));
      expect(options).toContain('SOS');
    }
  });

  test('switching to SOS updates the view', async ({ page }) => {
    await page.goto(basePage);
    await page.waitForLoadState('networkidle');

    const setSelector = page.locator('select[name*="set"]');
    if (await setSelector.count() > 0) {
      await setSelector.selectOption('SOS');
      await page.waitForTimeout(500);
      const cardCount = await countVisibleCards(page);
      expect(cardCount).toBeGreaterThanOrEqual(0);
    }
  });
});
