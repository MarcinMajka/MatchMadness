import { toRomaji } from 'https://unpkg.com/wanakana@5.3.1/esm/index.js';

/**
 * Shuffle (randomize the order of) an array of leftColumnValues.
 * NOTE: there is no reason for this function to accept a dictionary as an argument, let's keep it simple.
 * @param array - an array of strings
 * @returns  a new array with the same strings, but in a random order
 */
export const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export const fitTextToContainer = (element) => {
  let fontSize = 30;
  element.style.fontSize = fontSize + 'px';

  while (element.scrollHeight > element.offsetHeight && fontSize > 10) {
    fontSize--;
    element.style.fontSize = fontSize + 'px';
  }
};

// TODO
const getSameKanjiInSetObject = (data) => {
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

/*
  Plan:
    1. get an object with kanjis that appear multiple times in one set
    2. get an object with kanjis and their readings in an array as values
    3. get an object with ALL kanjis from JMdict used
    4. find a way to store the object from #3 in the browser for further usage
*/

export const displayHint = (currentInputElement, currentSet, wordIndex) => {
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
  let word = toRomaji(currentSet[wordIndex - 1].reading);
  let input = currentInputElement.value;
  let i = 0;

  while (word[i] === input[i]) {
    hint += word[i];
    i++;
  }

  currentInputElement.value = '';
  currentInputElement.placeholder = hint.length > 0 ? hint : word[0];
};

// module.exports = {
//   shuffleArray,
// };
