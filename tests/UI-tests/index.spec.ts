import { test, expect } from '@playwright/test';
import { IndexPage } from '../../pages/index.page';

test.describe('Checks for menu buttons', () => {
  let indexPage: IndexPage;

  test.beforeEach(async ({ page }) => {
    indexPage = new IndexPage(page);
    await page.goto('/');
  });

  test('Checks for buttons', async ({ page }) => {
    await expect(indexPage.menuButtons.first()).toHaveText('Match Madness');
  });

  test('Checks for menu buttons number', async ({ page }) => {
    await expect(indexPage.menuButtons).toHaveCount(7);
  });
});