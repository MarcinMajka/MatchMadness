import { test, expect } from '@playwright/test';
import { MatchMadness } from '../../pages/matchMadness.page';
import { IndexPage } from '../../pages/index.page';

test.describe('User selects number of pairs to display per screen', () => {
  let indexPage: IndexPage;
  let matchMadnessPage: MatchMadness;

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
      await indexPage.matchMadnessButton.click();
      // await page.click('.menuButton:has-text("Match Madness")');

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

// TODO: make a test that takes first .box value from the left, looks for correct hiragana value and selects the correct .box from the right
test.describe('Playing the game', () => {
  let indexPage: IndexPage;
  let matchMadnessPage: MatchMadness;
  let currentSet: Array<Object>;

  test.beforeEach(async ({ page }) => {
    indexPage = new IndexPage(page);
    matchMadnessPage = new MatchMadness(page);
    await page.goto('/');
    // Needed for fetching kanjis from dicIn50WordSets.json
    await page.waitForTimeout(100);

    indexPage.matchMadnessButton.click();    

    // Handle the option of getItem() returing an error
    currentSet = await page.evaluate(() => {
      const item = localStorage.getItem('currentSet');
      return item ? JSON.parse(item) : [];
    });
  });

  // test('Selects correct answers only', ({ page }) => {
  //   const currentWords = matchMadnessPage.leftColumn.locator('.box');
  //   console.log(currentWords);
  //   // for (const word of currentWords) {

  //   // }
  // });
});