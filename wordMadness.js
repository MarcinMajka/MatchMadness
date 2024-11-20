import { getElement, createUIElement } from './wrappers.js';
import { hiraganaToRomaji } from './utils.js';

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

const displayHint = (currentInputElement) => {
  /*
    Currently the function shows:
    - the first character of reading, for incorrect first character.
    - correctly guessed characters, without additional hint character
    
    TODO: do we want this behaviour?

    We could give a hint character after each next incorrect guess.

    So, if reading to guess is qwerty and the input is qw:
    - Current behaviour:
      After first try - qw
      After second try - qw
      After third try - qw
      ...
    - Proposed behaviour:
      After first try - qw
      After second try - qwe
      After third try - qwer
      After fourth try - qwert
      After fifth try - qwerty <- this input finally wins current word
    
    This would make it possible to win every word, while accruing many failed attempts.
    Seems in line with the idea behind the app :)
  */
  let hint = '';
  let word = hiraganaToRomaji(data[wordIndex - 1].reading);
  let input = currentInputElement.value;
  console.log('word: ' + word + ' input: ' + input);
  let i = 0;

  while (word[i] === input[i]) {
    hint += word[i];
    i++;
  }

  currentInputElement.value = '';
  currentInputElement.placeholder = hint.length > 0 ? hint : word[0];
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
  // Get fresh reference to input element since it may have been replaced
  const currentInput = getElement('#userInput');

  if (e.code === 'Space' || e.code === 'Enter') {
    const inputValue = currentInput.value.trim();
    const currentWord = data[wordIndex - 1];
    const inputMatchesReading =
      inputValue === hiraganaToRomaji(currentWord.reading);

    if (inputMatchesReading) {
      currentSetMatchCount++;
      updateGlossary();
      updateWord();
    } else {
      // If input is blank, let's not count it towards fails
      if (inputValue === '') return;
      displayHint(currentInput);
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
