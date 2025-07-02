import { Page, Locator } from '@playwright/test';

export class MatchMadness {
  page: Page;
  pairInput: Locator;
  leftColumn: Locator;
  rightColumn: Locator;
  menuButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pairInput = page.locator('#setPairsToRenderInput');
    this.leftColumn = page.locator('.leftColumn');
    this.rightColumn = page.locator('.rightColumn');
    this.menuButton = page.locator('a.button.menu');
  }
}
