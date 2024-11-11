import { getElement, createUIElement } from './wrappers.js';

const wordMadnessWord = getElement('#word');
const wordMadnessInput = getElement('#userInput');
const wordMadnessGlossary = getElement('#glossary');
const matchesInSetButton = getElement('#matches');
const wrongCountInSetButton = getElement('#wrong');

const data = JSON.parse(localStorage.getItem('currentSet'));

/*
  Plan:
    1. get an object with kanjis that appear multiple times in one set
    2. get an object with kanjis and their readings in an array as values
    3. get an object with ALL kanjis from JMdict used
    4. find a way to store the object from #3 in the browser for further usage
*/

const displayHint = () => {
  // This is one place where the input value is manipulated
  console.log('displayHint');
  console.log(data[wordIndex - 1].reading[0]);
  wordMadnessInput.value = data[wordIndex - 1].reading[0];
};

const getSameKanjiInSetObject = () => {
  const sameKanjiObjectCounter = {};
  const sameKanjiObject = {};

  // Count all occurrences and collect readings
  data.forEach((element) => {
    const k = element.kanji;

    if (sameKanjiObjectCounter[k]) {
      sameKanjiObjectCounter[k] += 1;
      // Add subsequent readings
      sameKanjiObject[k].push(element.reading);
    } else {
      // Initialize counter
      sameKanjiObjectCounter[k] = 1;
      // Add first reading
      sameKanjiObject[k] = [element.reading];
    }
  });

  // Filter out kanji that appear only once
  Object.keys(sameKanjiObjectCounter).forEach((k) => {
    if (sameKanjiObjectCounter[k] === 1) {
      delete sameKanjiObject[k];
    }
  });

  return sameKanjiObject;
};

window.getSameKanjiInSetObject = getSameKanjiInSetObject;

let wordIndex = 0;
let currentSetMatchCount = 0;
let wrongCountInSet = 0;

// Helper function to get current input element - created to avoid conflicts with imported getElement wrapper
// and to ensure we always get the most current reference to the input element, even after replacing it
const getCurrentInput = (selector) => document.querySelector(selector);

function validateInput(e) {
  // Get fresh reference to input element since it may have been replaced
  const currentInput = getCurrentInput('#userInput');

  if (e.code === 'Space' || e.code === 'Enter') {
    const inputMatchesReading =
      currentInput.value.trim() === data[wordIndex - 1].reading;
    const inputMatchesKanji =
      currentInput.value.trim() === data[wordIndex - 1].kanji;
    if (inputMatchesReading || inputMatchesKanji) {
      currentSetMatchCount++;
      updateGlossary();
      updateWord();
    } else {
      // If input is blank, let's not count it towards fails
      if (currentInput.value === '') return;
      displayHint();
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
    getCurrentInput('#userInput').replaceWith(newInput);

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

wordMadnessInput.addEventListener('keyup', validateInput);
wordMadnessInput.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
  }
});

window.addEventListener('load', () => {
  updateWord();
  wordMadnessInput.focus();
  displayMatches();
  displayFailedTries();
});
