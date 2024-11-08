import { getElement } from './wrappers.js';

const wordMadnessWord = getElement('#word');
const wordMadnessInput = getElement('#userInput');
const wordMadnessGlossary = getElement('#glossary');
const matchesInSetButton = getElement('#matches');
const wrongCountInSetButton = getElement('#wrong');

const data = JSON.parse(localStorage.getItem('currentSet'));

// TODO: Bug fix:
/**
 * 1. Switch to Japanese keyboard
 * 2. Input hiragana
 * 3. Select a correct option from the dictionary dropdown
 * 4. Tap any key
 *
 * Expected result:
 *  The tapped key is displayed in the input
 *
 * Actual result:
 *  The previously selected option is displayed before the currently pressed key
 */

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

function validateInput(e) {
  if (e.code === 'Space' || e.code === 'Enter') {
    const inputMatchesReading =
      wordMadnessInput.value.trim() === data[wordIndex - 1].reading;
    const inputMatchesKanji =
      wordMadnessInput.value.trim() === data[wordIndex - 1].kanji;
    if (inputMatchesReading || inputMatchesKanji) {
      currentSetMatchCount++;
      updateGlossary();
      updateWord();
    } else {
      //   If input is blank, let's not count it towards fails
      if (wordMadnessInput.value === '') return;
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
    wordMadnessInput.value = '';
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
