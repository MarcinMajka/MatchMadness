import { displayHint } from './utils.js';
import { getElement, createUIElement } from './wrappers.js';
import { toRomaji } from './node_modules/wanakana/esm/index.js';

const wordMadnessWord = getElement('#word');
const wordMadnessInput = getElement('#userInput');
const wordMadnessGlossary = getElement('#glossary');
const matchesInSetButton = getElement('#matches');
const wrongCountInSetButton = getElement('#wrong');

const data = JSON.parse(localStorage.getItem('currentSet'));

let wordIndex = 0;
let currentSetMatchCount = 0;
let wrongCountInSet = 0;

function validateInput(e) {
  // Get fresh reference to input element since it may have been replaced
  const currentInput = getElement('#userInput');

  if (e.code === 'Space' || e.code === 'Enter') {
    const inputValue = currentInput.value.trim();
    const currentWord = data[wordIndex - 1];
    const inputMatchesReading = inputValue === toRomaji(currentWord.reading);

    if (inputMatchesReading) {
      currentSetMatchCount++;
      updateGlossary();
      updateWord();
    } else {
      // If input is blank, let's not count it towards fails
      if (inputValue === '') return;
      displayHint(currentInput, data, wordIndex);
      wrongCountInSet++;
      displayFailedTries();
    }
  }
}

function updateWord() {
  console.log(data[wordIndex]);
  displayMatches();
  if (wordIndex < data.length) {
    wordMadnessWord.innerText = data[wordIndex].kanji;

    // Create fresh input element to fix IME (Input Method Editor) persistence issues
    // This prevents Japanese input method from reappearing when it should be cleared
    const newInput = createUIElement('input');
    newInput.type = 'text';
    newInput.id = 'userInput';

    // Add event listeners to new input since they don't carry over from old element
    newInput.addEventListener('keyup', validateInput);
    newInput.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
      }
    });

    // Replace old input with new one while maintaining exact position in DOM
    getElement('#userInput').replaceWith(newInput);

    // Focus new input to allow immediate typing
    newInput.focus();

    wordIndex++;
  } else {
    wordIndex = 0;
    currentSetMatchCount = 0;
    if (wordIndex === data.length) {
      updateWord();
    } else {
      alert('Congrats!');
    }
  }
}

function updateGlossary() {
  wordMadnessGlossary.innerText = `${data[wordIndex - 1].kanji} - ${
    data[wordIndex - 1].reading
  }\n ${data[wordIndex - 1].glossary}`;
}

function displayMatches() {
  const currentSetLenght = data.length;
  matchesInSetButton.innerText = `${currentSetMatchCount}/${currentSetLenght}`;
}

function displayFailedTries() {
  wrongCountInSetButton.innerText = `Fails: ${wrongCountInSet}`;
}

window.addEventListener('load', () => {
  updateWord();
  wordMadnessInput.focus();
  displayMatches();
  displayFailedTries();
});
