/**
 * Shuffle (randomize the order of) an array of words.
 * NOTE: there is no reason for this function to accept a dictionary as an argument, let's keep it simple.
 * @param array - an array of strings
 * @returns  a new array with the same strings, but in a random order
 */
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// -------------------
// Lets try to keep the global variables to a minimum.

// some constants:
const ANIMATION_DURATION = 200;
// pairCount shouldn't be bigger than the number of Object.keys(DATA).length, otherwise only words will be rendered
let pairCount = 3;

// We are storing the reference to the last clicked divs in the global scope, so we can access them from any function.
let firstClicked = null;
let secondClicked = null;

// Get the list of english words from the dictionary and shuffle them (we want each game to be different)
const shuffledKeys = shuffleArray(Object.keys(DATA));
// safety check - if desired pairCount >= shuffledKeys.length -> pairCount = shuffledKeys.length - 1
if (pairCount >= shuffledKeys.length) {
    pairCount = shuffledKeys.length;
}
// Create the pairs of words and kanjis
const wordPairs = shuffledKeys.map((word) => [word, DATA[word]]);
// keep track of the last used pair
let lastUsedPairIndex = 0;
// kep track of the number of found pairs
let foundPairs = 0;
// -------------------

/**
 * Dynamically create the divs for words and kanjis and append them to the HTML.
 * @param  wordPairs - an array of pairs of words and kanjis, like [['word1', 'translation1'] ...
 * @param  pairRenderLimitIndex - index of the last pair to render + 1
 */
const setupRound = (wordPairs, pairRenderLimitIndex) => {
  // Find the containers for words and kanjis
  const containerWords = document.querySelector(".english");
  const containerKanjis = document.querySelector(".kanji");

  let kanjis = [];

  // create the divs for the words
  while (lastUsedPairIndex < pairRenderLimitIndex) {
    const word = document.createElement("div");
    const wordValue = wordPairs[lastUsedPairIndex][0];

    word.classList.add(`box`);
    word.innerHTML = wordValue;
    // NOTE: we are adding the same function as the event listener to both the word and the kanji. This function will
    // accept the event object as an argument, so we can access the clicked element from it.
    word.addEventListener("click", checkIfMatch);
    containerWords.appendChild(word);

    const kanji = document.createElement("div");
    const kanjiValue = wordPairs[lastUsedPairIndex][1];
    kanji.classList.add(`box`);
    kanji.innerHTML = kanjiValue;
    kanji.addEventListener("click", checkIfMatch);
    kanjis.push(kanji);
    // NOTE: do not add the kanji to the container here, we will shuffle them later

    lastUsedPairIndex++;
  }

  // now shuffle the kanjis and append them to the container
  kanjis = shuffleArray(kanjis);
  kanjis.forEach((kanji) => containerKanjis.appendChild(kanji));
};

/**
 * Highlight the elements for a short period of time by adding a class to them and then removing it after a timeout.
 * @param elements - an array of DOM elements
 * @param className - the class to add and then remove
 */
function highlightElements(elements, className) {
  elements.forEach((element) => element.classList.add(className));
  setTimeout(() => {
    elements.forEach((element) => element.classList.remove(className));
  }, ANIMATION_DURATION);
}

/**
 * 
 * @param {target} event - check if selected word and translation match.
 */

const checkIfMatch = (event) => {
  const clickedElement = event.target;

  // if first is null, assign the clicked element to first, then if second is null, assign the clicked element to second.
  // Subsequent click will reset second value and set first to the clicked element. So the first value will always be filled, until the end of the game.
  if (firstClicked === null) {
    firstClicked = clickedElement;
    firstClicked.classList.add("selected");
  } else if (secondClicked === null) {
    secondClicked = clickedElement;
    secondClicked.classList.add("selected");
  } else {
    // Reset the styles on the old elements...
    firstClicked.classList.remove("selected");
    secondClicked.classList.remove("selected");
    // ... and reset the values
    firstClicked = clickedElement;
    secondClicked = null;
  }

  const valuesAreFilled = firstClicked !== null && secondClicked !== null;

  if (valuesAreFilled) {
    const firstValue = firstClicked.innerHTML;
    const secondValue = secondClicked.innerHTML;
    // TODO: what if I click the same element twice?
    // TODO: what if the first clicked element is kanji?

    const expectedValue = DATA[firstValue];
    if (secondValue === expectedValue) {
      highlightElements([firstClicked, secondClicked], "correct");

      // Remove the elements after a short delay.
      // TODO: what if user clicks on the elements while they are being removed?
      setTimeout(() => {
        // TODO: move the logic for removing the elements to a separate function.
        firstClicked.remove();
        secondClicked.remove();
        firstClicked = null;
        secondClicked = null;
        foundPairs++;

        checkIfWon();
      }, ANIMATION_DURATION);
    } else {
      console.log("not a match");
      highlightElements([firstClicked, secondClicked], "wrong");

      // TODO: move the logic for resetting the values to a separate function (maybe reuse the delete function?)
      // Reset the "selected" styles on the unmached elements...
      firstClicked.classList.remove("selected");
      secondClicked.classList.remove("selected");
      // And reset the references
      firstClicked = null;
      secondClicked = null;
    }
  }
};

/**
 * Check if next round should be set up or if the game has been won.
 */

const checkIfWon = () => {
    const isWin = foundPairs === wordPairs.length;
    const isCurrentRoundOver = foundPairs % pairCount === 0;
    const pairsWereFound = foundPairs !== 0;
    const shouldSetupNextRound = isCurrentRoundOver && pairsWereFound && !isWin;

    if (shouldSetupNextRound) {
      const lastSetOfPairsNumber = wordPairs.length % pairCount;
      if (lastUsedPairIndex + pairCount > wordPairs.length) {
        setupRound(wordPairs, lastUsedPairIndex + lastSetOfPairsNumber);
      } else {
        setupRound(wordPairs, lastUsedPairIndex + pairCount);
      }
    }

    if (isWin) {
      // TODO: display the time it took to win the game
      alert("You won!");
    }
}

window.addEventListener("load", () => {
  // We are starting the game when the page is loaded - before that, we don't have the divs to work with (they are not rendered yet)
  // Create the initial state of the game - generate the divs with words and kanjis in HTML.
  setupRound(wordPairs, pairCount);
  // TODO: add a function to start the timer here.
});
