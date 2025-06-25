import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('http://127.0.0.1:5500/');
  await expect(page.locator('.menuButton').first()).toHaveText('Match Madness');
});