import { test, expect } from '@playwright/test';
import { IndexPage } from '../../pages/index.page';

test.describe('Checks for menu buttons', () => {
  let indexPage: IndexPage;

  test.beforeEach(async ({ page }) => {
    indexPage = new IndexPage(page);
    await page.goto('/');
  });

  test('Checks for menu buttons number', async ({ page }) => {
    await expect(indexPage.menuButtons).toHaveCount(7);
  });

  test('Checks for Match Madness', async ({ page }) => {
    await expect(indexPage.menuButtons.first()).toHaveText('Match Madness');
  });

  test('Checks for Word Madness', async ({ page }) => {
    await expect(indexPage.menuButtons.nth(1)).toHaveText('Word Madness');
  });

  test('Checks for Hiragana Madness', async ({ page }) => {
    await expect(indexPage.menuButtons.nth(2)).toHaveText('Hiragana Madness');
  });

  test('Checks for Katakana Madness', async ({ page }) => {
    await expect(indexPage.menuButtons.nth(3)).toHaveText('Katakana Madness');
  });

  test('Checks for Memory Madness', async ({ page }) => {
    await expect(indexPage.menuButtons.nth(4)).toHaveText('Memory Madness');
  });

  test('Checks for Add Fav Words', async ({ page }) => {
    await expect(indexPage.menuButtons.nth(5)).toHaveText('Add Fav Words');
  });

  test('Checks for Use Favorite Words!', async ({ page }) => {
    await expect(indexPage.menuButtons.nth(6)).toHaveText('Use Favorite Words!');
  });
});