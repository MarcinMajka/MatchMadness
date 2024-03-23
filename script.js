const { JM } = require("./dic");

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
const ANIMATION_DURATION = 250;

const totalWordsInSessionCount = 8;
// pairsToRenderCount shouldn't be bigger than the totalWordsInSessionCount, otherwise only words will be rendered
let pairsToRenderCount = 3;
// safety check - if desired pairsToRenderCount >= shuffledKeys.length -> pairsToRenderCount = shuffledKeys.length - 1
if (pairsToRenderCount > totalWordsInSessionCount) {
  pairsToRenderCount = totalWordsInSessionCount;
}

// We are storing the reference to the last clicked divs in the global scope, so we can access them from any function.
let kanjiClicked = null;
let hiraganaClicked = null;

// keep track of the last used pair
let lastUsedPairIndex = 0;
// keep track of the number of found pairs
let foundPairs = 0;
// variables for starting the timer and incrementing the time
let gameStart;
let timerInterval;
// -------------------

const createWordReadingGlossaryTriplets = (totalWordsInSession, dataObject) => {
  const wordReadingGlossaryTriplets = [];
  for (let i = 0; i < totalWordsInSession; i++) {
    if (i === dataObject.length) return wordReadingGlossaryTriplets;
    const word = dataObject[i].kanji;
    const reading = dataObject[i]["hiragana/katakana"];
    const glossary = dataObject[i].glossary;
    wordReadingGlossaryTriplets.push([word, reading, glossary]);
  }
  return wordReadingGlossaryTriplets;
};

const kanjiHiraganaGlossary = createWordReadingGlossaryTriplets(
  totalWordsInSessionCount,
  JM
);
const shuffledKanjiHiraganaGlossaries = shuffleArray(kanjiHiraganaGlossary);

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
    const kanji = document.createElement("div");
    const wordValue = wordPairs[lastUsedPairIndex][0];

    kanji.classList.add(`box`);
    kanji.innerHTML = wordValue;
    // NOTE: we are adding the same function as the event listener to both the word and the kanji. This function will
    // accept the event object as an argument, so we can access the clicked element from it.
    kanji.addEventListener("click", checkIfMatch);
    containerWords.appendChild(kanji);

    const hiragana = document.createElement("div");
    const hiraganaValue = wordPairs[lastUsedPairIndex][1];
    hiragana.classList.add(`box`);
    hiragana.innerHTML = hiraganaValue;
    hiragana.addEventListener("click", checkIfMatch);
    kanjis.push(hiragana);
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
  // english or kanji
  const clickedElementsParentElementsClass =
    clickedElement.parentElement.getAttribute("class");
  // true if word was selected, false if kanji was selected
  const isWordColumnSelected = clickedElementsParentElementsClass === "english";
  if (isWordColumnSelected) {
    if (kanjiClicked === null) {
      kanjiClicked = clickedElement;
      kanjiClicked.classList.add("selected");
    } else {
      kanjiClicked.classList.remove("selected");
      kanjiClicked = clickedElement;
      kanjiClicked.classList.add("selected");
    }
  } else {
    if (hiraganaClicked === null) {
      hiraganaClicked = clickedElement;
      hiraganaClicked.classList.add("selected");
    } else {
      hiraganaClicked.classList.remove("selected");
      hiraganaClicked = clickedElement;
      hiraganaClicked.classList.add("selected");
    }
  }
  // if both values are filled
  if (kanjiClicked !== null && hiraganaClicked !== null) {
    const kanji = kanjiClicked.innerHTML;
    const hiragana = hiraganaClicked.innerHTML;
    console.log("kanji: " + kanji + " hiragana: " + hiragana);
    let expectedHiragana = null;
    // Index of the shuffledKanjiHiraganaGlossaries triple, to take the glossary from
    let glossaryIndex = null;
    for (
      let i = lastUsedPairIndex - pairsToRenderCount;
      i < lastUsedPairIndex;
      i++
    ) {
      console.log("i: ", i);
      console.log(
        "hiragana: " +
          hiragana +
          " shuffledKanjiHiraganaGlossaries[i][1]: " +
          shuffledKanjiHiraganaGlossaries[i][1]
      );
      if (
        kanji === shuffledKanjiHiraganaGlossaries[i][0] &&
        hiragana === shuffledKanjiHiraganaGlossaries[i][1]
      ) {
        expectedHiragana = shuffledKanjiHiraganaGlossaries[i][1];
        glossaryIndex = i;
        break;
      }
    }

    if (hiragana === expectedHiragana) {
      highlightElements([kanjiClicked, hiraganaClicked], "correct");
      const kanjiAndHiragana = document.getElementById("kanjiAndHiragana");
      const glossary = document.getElementById("glossary");
      kanjiAndHiragana.innerHTML = `${kanji} - ${hiragana}:`;
      glossary.innerHTML = shuffledKanjiHiraganaGlossaries[glossaryIndex][2];
      // assigning kanjiClicked and hiraganaClicked to different values, so that the User can select other divs during the animation
      const kanjiToRemove = kanjiClicked;
      const hiraganaToRemove = hiraganaClicked;
      kanjiClicked = null;
      hiraganaClicked = null;
      // Remove the elements after a short delay.
      setTimeout(() => {
        removeElements([kanjiToRemove, hiraganaToRemove], "correct");

        foundPairs++;

        checkIfWon();
      }, ANIMATION_DURATION);
    } else {
      console.log("not a match");
      highlightElements([kanjiClicked, hiraganaClicked], "wrong");
      // Reset the "selected" styles on the unmached elements...
      removeElements([kanjiClicked, hiraganaClicked], "wrong");
      // And reset the references
      kanjiClicked = null;
      hiraganaClicked = null;
    }
  }
};

/**
 *
 * @param elements - array of elements to remove, or to remove the "selected" class
 * @param correctOrWrong - string of the class name of the element to remove -> "correct" or "wrong"
 */

const removeElements = (elements, correctOrWrong) => {
  if (correctOrWrong === "correct") {
    elements.forEach((element) => element.remove());
  } else {
    elements.forEach((element) => element.classList.remove("selected"));
  }
};

/**
 * Check if next round should be set up or if the game has been won.
 */

const checkIfWon = () => {
  const isWin = foundPairs === totalWordsInSessionCount;
  const isCurrentRoundOver = foundPairs % pairsToRenderCount === 0;
  const pairsWereFound = foundPairs !== 0;
  const shouldSetupNextRound = isCurrentRoundOver && pairsWereFound && !isWin;

  if (shouldSetupNextRound) {
    const lastSetOfPairsNumber = totalWordsInSessionCount % pairsToRenderCount;
    if (lastUsedPairIndex + pairsToRenderCount > totalWordsInSessionCount) {
      setupRound(
        shuffledKanjiHiraganaGlossaries,
        lastUsedPairIndex + lastSetOfPairsNumber
      );
    } else {
      setupRound(
        shuffledKanjiHiraganaGlossaries,
        lastUsedPairIndex + pairsToRenderCount
      );
    }
  }

  if (isWin) {
    stopTimer();
  }
};

/**
 * Timer functions
 */

const starTimer = () => {
  gameStart = Date.now();
  // Update timer every second
  timerInterval = setInterval(updateTimer, 1000);
};

const stopTimer = () => {
  // Stop the timer
  clearInterval(timerInterval);
  const gameEnd = Date.now();
  // Convert to seconds
  const gameDuration = (gameEnd - gameStart) / 1000;
  alert(`Game duration: ${Math.floor(gameDuration)} seconds`);
};

const updateTimer = () => {
  const currentTime = Date.now();
  const elapsedTime = currentTime - gameStart;
  const minutes = Math.floor(elapsedTime / 60000);
  const seconds = Math.floor((elapsedTime % 60000) / 1000);
  document.getElementById("timer").innerText = `${formatTime(
    minutes
  )}:${formatTime(seconds)}`;
};
/**
 *
 * @param time - minutes or seconds as ints.
 * @returns string formatted in mm:ss format.
 */
const formatTime = (time) => {
  // If time is smaller than 10, add 0 in front, eg. 00:03, instead of 0:3.
  return time < 10 ? `0${time}` : time;
};

// window.addEventListener("load", () => {
//   // We are starting the game when the page is loaded - before that, we don't have the divs to work with (they are not rendered yet).
//   // Create the initial state of the game - generate the divs with kanji and hiragana/katakana in HTML.
//   setupRound(shuffledKanjiHiraganaGlossaries, pairsToRenderCount);
//   starTimer();
// });

module.exports = {
  shuffleArray,
  createWordReadingGlossaryTriplets,
  formatTime,
};
