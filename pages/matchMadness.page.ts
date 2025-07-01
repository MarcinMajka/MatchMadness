import { Page, Locator } from '@playwright/test';

export class MatchMadness {
  page: Page;
  pairInput: Locator;
  leftColumn: Locator;
  rightColumn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pairInput = page.locator('#setPairsToRenderInput');
    this.leftColumn = page.locator('.leftColumn');
    this.rightColumn = page.locator('.rightColumn');
  }
}
