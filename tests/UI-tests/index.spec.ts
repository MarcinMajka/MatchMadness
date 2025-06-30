import { test, expect } from '@playwright/test';

test('Checks for buttons', async ({ page }) => {
  await page.goto('http://127.0.0.1:5500/');
  await expect(page.locator('.menuButton').first()).toHaveText('Match Madness');
});

test('Checks for menu buttons number', async ({ page }) => {
  await page.goto('http://127.0.0.1:5500/');
  const menuButtons = page.locator('.menuButton');
  await expect(menuButtons).toHaveCount(7);
});
