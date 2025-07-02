import { Page, Locator } from '@playwright/test';

export class IndexPage {
    page: Page;
    pairInput: Locator;
    setInput: Locator;
    menuButtons: Locator;
    matchMadnessButton: Locator;
    wordMadnessButton: Locator;
    hiraganaMadnessButton: Locator;
    katakanaMadnessButton: Locator;
    memoryMadnessButton: Locator;
    addFavWordsButton: Locator;
    useFavWordsButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.pairInput = page.locator('#setPairsToRenderInput');
        this.setInput = page.locator('#setIndexInput');
        this.menuButtons = page.locator('.menuButton');
        this.matchMadnessButton = page.locator('a.menuButton[href="matchMadness.html"]');
        this.wordMadnessButton = page.locator('a.menuButton[href="wordMadness.html"]');
        this.hiraganaMadnessButton = page.locator('a.menuButton[href="hiraganaMadness.html"]');
        this.katakanaMadnessButton = page.locator('a.menuButton[href="katakanaMadness.html"]');
        this.memoryMadnessButton = page.locator('a.menuButton[href="memoryMadness.html"]');
        this.addFavWordsButton = this.menuButtons.locator(':has-text("Add Fav Words")');
        this.useFavWordsButton = this.menuButtons.locator(':has-text("Use Favorite Words!")');
    }
}
