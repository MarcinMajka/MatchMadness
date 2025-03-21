import { getElement, createUIElement } from './wrappers.js';
import {
  displayMatches,
  displayFailedTries,
  handleCompareThreeWordsResult,
} from './UI.js';
import {
  toRomaji,
  toKatakana,
} from 'https://unpkg.com/wanakana@5.3.1/esm/index.js';
import { displayHint, shuffleArray } from './utils.js';
import { addWord, deleteRecord, compareThreeWords } from './favoriteWords.js';

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
      glossaryWordAndReading: getElement('#leftValueRightValue'),
      likeButton: getElement('#wordGameLikeButton'),
    };

    // Game State
    this.data = shuffleArray(JSON.parse(localStorage.getItem('currentSet')));
    this.wordIndex = 0;
    this.currentSetMatchCount = 0;
    this.wrongCountInSet = 0;

    // Bind methods to maintain context
    this.validateInput = this.validateInput.bind(this);
    this.nextWord = this.nextWord.bind(this);
    this.toggleLike = this.toggleLike.bind(this);

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Initial game setup
    window.addEventListener('load', () => {
      this.nextWord();
      this.elements.input.focus();
      this.displayMatches();
      this.displayFailedTries();
    });

    // Optional next button
    const nextButton = document.getElementById(this.config.nextButtonId);
    if (nextButton) {
      nextButton.onclick = this.nextWord;
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
        const lb = this.elements.likeButton;
        lb.style.visibility = 'visible';

        compareThreeWords(
          currentWord.kanji,
          currentWord.reading,
          currentWord.glossary
        ).then((result) => {
          handleCompareThreeWordsResult(result, lb);
        });

        lb.addEventListener('click', (event) => {
          const wordIsLiked = event.target.classList.contains('liked');
          if (wordIsLiked) {
            deleteRecord(currentWord);
          } else {
            addWord(
              currentWord.kanji,
              currentWord.reading,
              currentWord.glossary
            );
          }
          this.toggleLike(lb);
        });
        this.currentSetMatchCount++;
        this.updateGlossary();
        this.nextWord();
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

  getWordValue() {
    const currentWord = this.data[this.wordIndex];
    return this.config.gameType === 'kanji'
      ? currentWord.kanji
      : this.config.gameType === 'katakana'
      ? toKatakana(currentWord.reading)
      : currentWord.reading;
  }

  updateWord() {
    this.elements.word.innerText = this.getWordValue();
  }

  nextWord() {
    this.displayMatches();

    if (this.wordIndex == this.data.length) {
      alert('Congrats!');
      return;
    }

    this.updateWord();

    // Replacing input element removes all IME issues
    this.replaceInputElement();
    // Focus on new input element
    getElement('#userInput').focus();

    this.wordIndex++;
  }

  updateGlossary() {
    const currentWord = this.data[this.wordIndex - 1];

    this.elements.glossaryWordAndReading.innerText = `${currentWord.kanji} - ${currentWord.reading}`;
    this.elements.glossary.innerText = currentWord.glossary;
  }

  displayMatches() {
    displayMatches(this.elements.matches, this.currentSetMatchCount);
  }

  displayFailedTries() {
    displayFailedTries(this.elements.wrong, this.wrongCountInSet);
  }

  toggleLike() {
    this.elements.likeButton.classList.toggle('liked');
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
