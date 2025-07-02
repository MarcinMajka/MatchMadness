import { test, expect } from '@playwright/test';
import { MatchMadness } from '../../pages/matchMadness.page';
import { IndexPage } from '../../pages/index.page';

test.describe('User selects number of pairs to display per screen', () => {
  let indexPage: IndexPage;
  let matchMadnessPage: MatchMadness;
  let currentSet;

  test.beforeEach(async ({ page }) => {
    indexPage = new IndexPage(page);
    matchMadnessPage = new MatchMadness(page);
    await page.goto('/');
    // Needed for fetching kanjis from dicIn50WordSets.json
    await page.waitForTimeout(100);
  });

  // Doesn't work on webkit
  test('Minimum pairs', async ({ page }) => {
    for (let i = 0; i <= 2; i++) {
      await indexPage.pairInput.fill(i.toString());
      await page.click('.menuButton:has-text("Match Madness")');

      currentSet = await page.evaluate(() => localStorage.getItem('currentSet'));

      if (i >= 0 && i <= 3) {
        await expect(matchMadnessPage.leftColumn.locator('.box')).toHaveCount(3);
        await expect(matchMadnessPage.rightColumn.locator('.box')).toHaveCount(3);
      }
      await matchMadnessPage.menuButton.click();
    }
  });
  
  test('Maximum pairs', async ({ page }) => {
    for (let i = 10; i >= 7; i--) {
      await indexPage.pairInput.fill(i.toString());
      await page.click('.menuButton:has-text("Match Madness")');
  
      await expect(matchMadnessPage.leftColumn.locator('.box')).toHaveCount(7);
      await expect(matchMadnessPage.rightColumn.locator('.box')).toHaveCount(7);
  
      await matchMadnessPage.menuButton.click();
    }
  });
  
  test('Valid pairs', async ({ page }) => {
    for (let i = 4; i <= 6; i++) {
      await indexPage.pairInput.fill(i.toString());
      await page.click('.menuButton:has-text("Match Madness")');
      
      await expect(matchMadnessPage.leftColumn.locator('.box')).toHaveCount(i);
      await expect(matchMadnessPage.rightColumn.locator('.box')).toHaveCount(i);
  
      await matchMadnessPage.menuButton.click();
    }
  });
});