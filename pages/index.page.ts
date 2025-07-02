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
        this.matchMadnessButton = this.menuButtons.locator(':has-text("Match Madness")');
        this.wordMadnessButton = this.menuButtons.locator(':has-text("Word Madness")');
        this.hiraganaMadnessButton = this.menuButtons.locator(':has-text("Hiragana Madness")');
        this.katakanaMadnessButton = this.menuButtons.locator(':has-text("Katakana Madness")');
        this.memoryMadnessButton = this.menuButtons.locator(':has-text("Memory Madness")');
        this.addFavWordsButton = this.menuButtons.locator(':has-text("Add Fav Words")');
        this.useFavWordsButton = this.menuButtons.locator(':has-text("Use Favorite Words!")');
    }
}
