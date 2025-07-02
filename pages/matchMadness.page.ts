import { Page, Locator } from '@playwright/test';

export class MatchMadness {
  page: Page;
  leftColumn: Locator;
  rightColumn: Locator;
  menuButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.leftColumn = page.locator('.leftColumn');
    this.rightColumn = page.locator('.rightColumn');
    this.menuButton = page.locator('a.button.menu');
  }
}
