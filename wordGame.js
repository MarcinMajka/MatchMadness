import { getElement, createUIElement } from './wrappers.js';
import { toRomaji, toKatakana } from './node_modules/wanakana/esm/index.js';
import { displayHint } from './utils.js';

class WordGame {
  constructor(config) {
    // Configuration options with defaults
    this.config = {
      gameType: 'kanji',
      hintFunction: displayHint,
      nextButtonId: 'testNext',
      ...config,
    };

    // DOM Element References
    this.elements = {
      word: getElement('#word'),
      input: getElement('#userInput'),
      glossary: getElement('#glossary'),
      matches: getElement('#matches'),
      wrong: getElement('#wrong'),
    };

    // Game State
    this.data = JSON.parse(localStorage.getItem('currentSet'));
    this.wordIndex = 0;
    this.currentSetMatchCount = 0;
    this.wrongCountInSet = 0;

    // Bind methods to maintain context
    this.validateInput = this.validateInput.bind(this);
    this.updateWord = this.updateWord.bind(this);

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Initial game setup
    window.addEventListener('load', () => {
      this.updateWord();
      this.elements.input.focus();
      this.displayMatches();
      this.displayFailedTries();
    });

    // Optional next button
    const nextButton = document.getElementById(this.config.nextButtonId);
    if (nextButton) {
      nextButton.onclick = this.updateWord;
    }
  }

  validateInput(e) {
    if (e.code === 'Space' || e.code === 'Enter') {
      const currentInput = getElement('#userInput');
      const inputValue = currentInput.value.trim();

      // Skip empty inputs
      if (inputValue === '') return;

      const currentWord = this.data[this.wordIndex - 1];
      const inputMatchesReading = inputValue === toRomaji(currentWord.reading);

      if (inputMatchesReading) {
        this.currentSetMatchCount++;
        this.updateGlossary();
        this.updateWord();
      } else {
        this.config.hintFunction(currentInput, this.data, this.wordIndex);
        this.wrongCountInSet++;
        this.displayFailedTries();
      }
    }
  }

  replaceInputElement() {
    const newInput = createUIElement('input');
    newInput.type = 'text';
    newInput.id = 'userInput';

    newInput.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
      }
    });

    newInput.addEventListener('keyup', this.validateInput);

    getElement('#userInput').replaceWith(newInput);
  }

  updateWord() {
    this.displayMatches();

    if (this.wordIndex < this.data.length) {
      const currentWord = this.data[this.wordIndex];
      const displayValue =
        this.config.gameType === 'kanji'
          ? currentWord.kanji
          : this.config.gameType === 'katakana'
          ? toKatakana(currentWord.reading)
          : currentWord.reading;

      this.elements.word.innerText = displayValue;

      // Replacing input element removes all IME issues
      this.replaceInputElement();
      // Focus on new input element
      getElement('#userInput').focus();

      this.wordIndex++;
    } else {
      // Reset or complete game logic
      this.wordIndex = 0;
      this.currentSetMatchCount = 0;

      if (this.wordIndex === this.data.length) {
        this.updateWord();
      } else {
        alert('Congrats!');
      }
    }
  }

  updateGlossary() {
    const currentWord = this.data[this.wordIndex - 1];
    this.elements.glossary.innerText = `${currentWord.kanji} - ${currentWord.reading}\n${currentWord.glossary}`;
  }

  displayMatches() {
    const currentSetLength = this.data.length;
    this.elements.matches.innerText = `${this.currentSetMatchCount}/${currentSetLength}`;
  }

  displayFailedTries() {
    this.elements.wrong.innerText = `Fails: ${this.wrongCountInSet}`;
  }
}

const selectGame = () => {
  const page = window.location.pathname.split('/').pop();
  const gameType = page.replace('Madness.html', '').toLowerCase();
  new WordGame({
    gameType:
      gameType === 'katakana' || gameType === 'hiragana' ? gameType : 'kanji',
  });
};

selectGame();
