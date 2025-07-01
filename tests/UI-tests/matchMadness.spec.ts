import { test, expect } from '@playwright/test';

test.describe('User selects number of pairs to display per screen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Needed for fetching kanjis from dicIn50WordSets.json
    await page.waitForTimeout(100);
  });

  // Doesn't work on webkit
  test('Minimum pairs', async ({ page }) => {
    const pairInput = page.locator('#setPairsToRenderInput')
    const leftColumn = page.locator('.leftColumn');
    const rightColumn = page.locator('.rightColumn');
  
    for (let i = 0; i <= 2; i++) {
      await pairInput.fill(i.toString());
      await page.click('.menuButton:has-text("Match Madness")');
  
      if (i >= 0 && i <= 3) {
        await expect(leftColumn.locator('.box')).toHaveCount(3);
        await expect(rightColumn.locator('.box')).toHaveCount(3);
      }
      await page.click('a.button.menu');
    }
  });
  
  test('Maximum pairs', async ({ page }) => {
    const pairInput = page.locator('#setPairsToRenderInput')
    const leftColumn = page.locator('.leftColumn');
    const rightColumn = page.locator('.rightColumn');
  
    for (let i = 10; i >= 7; i--) {
      await pairInput.fill(i.toString());
      await page.click('.menuButton:has-text("Match Madness")');
  
      await expect(leftColumn.locator('.box')).toHaveCount(7);
      await expect(rightColumn.locator('.box')).toHaveCount(7);
  
      await page.click('a.button.menu');
    }
  });
  
  test('Valid pairs', async ({ page }) => {
    const pairInput = page.locator('#setPairsToRenderInput')
    const leftColumn = page.locator('.leftColumn');
    const rightColumn = page.locator('.rightColumn');
  
    for (let i = 4; i <= 6; i++) {
      await pairInput.fill(i.toString());
      await page.click('.menuButton:has-text("Match Madness")');
      
      await expect(leftColumn.locator('.box')).toHaveCount(i);
      await expect(rightColumn.locator('.box')).toHaveCount(i);
  
      await page.click('a.button.menu');
    }
  });
});