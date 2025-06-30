import { test, expect } from '@playwright/test';

// Doesn't work on webkit
test('Checks minimum pairs per screen', async ({ page }) => {
    await page.goto('http://127.0.0.1:5500/');
    // Needed for fetching kanjis from dicIn50WordSets.json
    await page.waitForTimeout(100);
    
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
  
  test('Checks maximum pairs per screen', async ({ page }) => {
    await page.goto('http://127.0.0.1:5500/');
    // Needed for fetching kanjis from dicIn50WordSets.json
    await page.waitForTimeout(100);
    
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
  
  test('Checks valid pairs per screen', async ({ page }) => {
    await page.goto('http://127.0.0.1:5500/');
    // Needed for fetching kanjis from dicIn50WordSets.json
    await page.waitForTimeout(100);
    
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