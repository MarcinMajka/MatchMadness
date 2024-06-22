// const { JM } = require('./dic')

/**
 * Shuffle (randomize the order of) an array of leftColumnValues.
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

const totalWordsInSessionCount = 4;
// pairsToRenderCount shouldn't be bigger than the totalWordsInSessionCount, otherwise only leftColumnValues will be rendered
let pairsToRenderCount = 3;
// safety check - if desired pairsToRenderCount >= shuffledKeys.length -> pairsToRenderCount = shuffledKeys.length - 1
if (pairsToRenderCount > totalWordsInSessionCount) {
  pairsToRenderCount = totalWordsInSessionCount;
}

// NOTE: we are storing the clicked divs in an object, so we have the reactiveness of the object - the values will be updated in the object, even if we pass the object to a function.
const initialState = {
  columnElements: {
    leftColumnElementValueClicked: null,
    rightColumnElementValueClicked: null,
  },
  // keep track of the last used pair
  lastUsedTripletIndex: 0,
  foundPairs: 0,
  // variable for keeping the game start time
  gameStart: null,
};

// -------------------

/**
 * Create an array of [leftColumnValue, rightColumnValue, glossary] triplets from dataObject
 * @param totalWordsInSession - number of total leftColumnValues in one game
 * @param dataObject - array of arrays
 * @returns  a new array with with these triplets
 */
const createLeftColValRightColValGlossaryTriplets = (
  totalWordsInSession,
  dataObject
) => {
  const leftColValRightColValGlossaryTriplets = [];
  for (let i = 0; i < totalWordsInSession; i++) {
    if (i === dataObject.length) return leftColValRightColValGlossaryTriplets;
    const leftValue = dataObject[i].kanji;
    const rightValue = dataObject[i]['hiragana/katakana'];
    const glossary = dataObject[i].glossary;
    leftColValRightColValGlossaryTriplets.push([
      leftValue,
      rightValue,
      glossary,
    ]);
  }
  return leftColValRightColValGlossaryTriplets;
};

// Splitting JM into an array of 50-word sets ---------------------------------------------
const allDicItemsIntoOneArray = createLeftColValRightColValGlossaryTriplets(
  JM.length,
  JM
);

const dicIn50WordSets = [];
let count = 50;

for (let i = 0; i < allDicItemsIntoOneArray.length; i++) {
  const tempArr = [];
  while (count && i < allDicItemsIntoOneArray.length) {
    tempArr.push(allDicItemsIntoOneArray[i]);
    i++;
    count--;
  }
  count = 50;
  dicIn50WordSets.push(tempArr);
}
// ----------------------------------------------------------------------------------------
const leftValRightValGlossary = createLeftColValRightColValGlossaryTriplets(
  totalWordsInSessionCount,
  JM
);

const shuffledLeftValRightValGlossary = shuffleArray(leftValRightValGlossary);

/**
 * Dynamically create the divs for leftColumnValues and rightColumnValues and append them to the HTML.
 * @param  leftColValRightColValPairs - an array of pairs of leftColumnValues and rightColumnValues, like [['word1', 'translation1'] ...
 * @param  pairRenderLimitIndex - index of the last pair to render + 1
 */
const setupRound = (
  state,
  leftColValRightColValPairs,
  pairRenderLimitIndex
) => {
  // Find the containers for leftColumnValues and rightColumnValues
  const containerLeftColumnValues = document.querySelector('.leftColumn');
  const containerRightColumnValues = document.querySelector('.rightColumn');

  let rightColumnValues = [];

  // create the divs for the leftColumnValues
  while (state.lastUsedTripletIndex < pairRenderLimitIndex) {
    const leftColumnElement = document.createElement('div');
    const leftColumnElementValue =
      leftColValRightColValPairs[state.lastUsedTripletIndex][0];

    leftColumnElement.classList.add(`box`);
    leftColumnElement.innerHTML = leftColumnElementValue;
    // NOTE: we are adding the same function as the event listener to both the word and the leftColumnElement. This function will
    // accept the event object as an argument, so we can access the clicked element from it.
    leftColumnElement.addEventListener('click', (event) =>
      checkIfMatch(event, state)
    );
    containerLeftColumnValues.appendChild(leftColumnElement);

    const rightColumnElement = document.createElement('div');
    const rightColumnElementValue =
      leftColValRightColValPairs[state.lastUsedTripletIndex][1];
    rightColumnElement.classList.add(`box`);
    rightColumnElement.innerHTML = rightColumnElementValue;
    rightColumnElement.addEventListener('click', (event) =>
      checkIfMatch(event, state)
    );
    rightColumnValues.push(rightColumnElement);
    // NOTE: do not add the leftColumnElement to the container here, we will shuffle them later

    state.lastUsedTripletIndex++;
  }

  // now shuffle the rightColumnValues and append them to the container
  rightColumnValues = shuffleArray(rightColumnValues);
  rightColumnValues.forEach((leftColumnElement) =>
    containerRightColumnValues.appendChild(leftColumnElement)
  );
};

/**
 * Highlight the elements for a short period of time by adding a class to them and then removing it after a timeout.
 * @param elements - an array of DOM elements
 * @param className - the class to add and then remove
 */
function highlightElements(elements, className) {
  // Highlighted elements should be disabled during the animation
  elements.forEach((element) => {
    element.classList.add(className);
    element.style.pointerEvents = 'none';
  });
  setTimeout(() => {
    elements.forEach((element) => {
      element.classList.remove(className);
      element.style.pointerEvents = '';
    });
  }, ANIMATION_DURATION);
}

/**
 *
 * @param {target} event - check if selected word and translation match.
 */

const checkIfMatch = (event, state) => {
  const clickedElement = event.target;

  // left or right column
  const clickedElementsParentElementsClass =
    clickedElement.parentElement.getAttribute('class');

  // true if left column was selected, false if right column was selected
  const elementFromLeftColumnIsSelected =
    clickedElementsParentElementsClass === 'leftColumn';
  if (elementFromLeftColumnIsSelected) {
    if (state.columnElements.leftColumnElementValueClicked === null) {
      state.columnElements.leftColumnElementValueClicked = clickedElement;
      state.columnElements.leftColumnElementValueClicked.classList.add(
        'selected'
      );
    } else {
      state.columnElements.leftColumnElementValueClicked.classList.remove(
        'selected'
      );
      state.columnElements.leftColumnElementValueClicked = clickedElement;
      state.columnElements.leftColumnElementValueClicked.classList.add(
        'selected'
      );
    }
  } else {
    if (state.columnElements.rightColumnElementValueClicked === null) {
      state.columnElements.rightColumnElementValueClicked = clickedElement;
      state.columnElements.rightColumnElementValueClicked.classList.add(
        'selected'
      );
    } else {
      state.columnElements.rightColumnElementValueClicked.classList.remove(
        'selected'
      );
      state.columnElements.rightColumnElementValueClicked = clickedElement;
      state.columnElements.rightColumnElementValueClicked.classList.add(
        'selected'
      );
    }
  }
  // if both values are filled
  if (
    state.columnElements.leftColumnElementValueClicked !== null &&
    state.columnElements.rightColumnElementValueClicked !== null
  ) {
    const leftColumnElementValue =
      state.columnElements.leftColumnElementValueClicked.innerHTML;
    const rightColumnElementValue =
      state.columnElements.rightColumnElementValueClicked.innerHTML;
    let expectedRightColumnValue = null;
    // Index of the shuffledLeftValRightValGlossary triple, to take the glossary from
    let glossaryIndex = null;
    for (
      let i = state.lastUsedTripletIndex - pairsToRenderCount;
      i < state.lastUsedTripletIndex;
      i++
    ) {
      if (
        leftColumnElementValue === shuffledLeftValRightValGlossary[i][0] &&
        rightColumnElementValue === shuffledLeftValRightValGlossary[i][1]
      ) {
        expectedRightColumnValue = shuffledLeftValRightValGlossary[i][1];
        glossaryIndex = i;
        break;
      }
    }

    if (rightColumnElementValue === expectedRightColumnValue) {
      highlightElements(
        [
          state.columnElements.leftColumnElementValueClicked,
          state.columnElements.rightColumnElementValueClicked,
        ],
        'correct'
      );

      const leftValueRightValue = document.getElementById(
        'leftValueRightValue'
      );
      const glossary = document.getElementById('glossary');
      leftValueRightValue.innerHTML = `${leftColumnElementValue} - ${rightColumnElementValue}:`;
      glossary.innerHTML = shuffledLeftValRightValGlossary[glossaryIndex][2];
      // assigning leftColumnElementValueClicked and rightColumnElementValueClicked to different values, so that the User can select other divs during the animation
      const leftElementToRemove =
        state.columnElements.leftColumnElementValueClicked;
      const rightElementToRemove =
        state.columnElements.rightColumnElementValueClicked;
      state.columnElements.leftColumnElementValueClicked = null;
      state.columnElements.rightColumnElementValueClicked = null;
      // Remove the elements after a short delay.
      setTimeout(() => {
        removeElements([leftElementToRemove, rightElementToRemove], 'correct');

        state.foundPairs++;

        checkIfWon(state);
      }, ANIMATION_DURATION);
    } else {
      highlightElements(
        [
          state.columnElements.leftColumnElementValueClicked,
          state.columnElements.rightColumnElementValueClicked,
        ],
        'wrong'
      );
      // Reset the "selected" styles on the unmached elements...
      removeElements(
        [
          state.columnElements.leftColumnElementValueClicked,
          state.columnElements.rightColumnElementValueClicked,
        ],
        'wrong'
      );
      // And reset the references
      state.columnElements.leftColumnElementValueClicked = null;
      state.columnElements.rightColumnElementValueClicked = null;
    }
  }
};

/**
 *
 * @param elements - array of elements to remove, or to remove the "selected" class
 * @param correctOrWrong - string of the class name of the element to remove -> "correct" or "wrong"
 */

const removeElements = (elements, correctOrWrong) => {
  if (correctOrWrong === 'correct') {
    elements.forEach((element) => element.remove());
  } else {
    elements.forEach((element) => element.classList.remove('selected'));
  }
};

/**
 * Check if next round should be set up or if the game has been won.
 */

const checkIfWon = (state) => {
  const isWin = state.foundPairs === totalWordsInSessionCount;
  const isCurrentRoundOver = state.foundPairs % pairsToRenderCount === 0;
  const pairsWereFound = state.foundPairs !== 0;
  const shouldSetupNextRound = isCurrentRoundOver && pairsWereFound && !isWin;

  if (shouldSetupNextRound) {
    const lastSetOfPairsNumber = totalWordsInSessionCount % pairsToRenderCount;
    const isLastSetToRender =
      state.lastUsedTripletIndex + pairsToRenderCount >
      totalWordsInSessionCount;
    if (isLastSetToRender) {
      setupRound(
        state,
        shuffledLeftValRightValGlossary,
        state.lastUsedTripletIndex + lastSetOfPairsNumber
      );
    } else {
      setupRound(
        state,
        shuffledLeftValRightValGlossary,
        state.lastUsedTripletIndex + pairsToRenderCount
      );
    }
  }

  if (isWin) {
    // Make buttons visible and actionable
    const buttons = document.querySelector('.buttonContainer');
    buttons.style.visibility = 'visible';
    stopTimer(state);
  }
};

/**
 * Timer functions
 */

const starTimer = (state) => {
  state.gameStart = Date.now();
  // Update timer every second
  timerInterval = setInterval(() => updateTimer(state), 1000);
};

const stopTimer = (state) => {
  // Stop the timer
  clearInterval(timerInterval);
  const gameEnd = Date.now();
  // Convert to seconds
  const gameDuration = (gameEnd - state.gameStart) / 1000;
  document.getElementById('timer').innerText = `Game duration: ${Math.floor(
    gameDuration
  )} seconds`;
};

const updateTimer = (state) => {
  const currentTime = Date.now();
  const elapsedTime = currentTime - state.gameStart;
  const minutes = Math.floor(elapsedTime / 60000);
  const seconds = Math.floor((elapsedTime % 60000) / 1000);
  document.getElementById('timer').innerText = `${formatTime(
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

window.addEventListener('load', (state) => {
  state = { ...initialState };
  // We are starting the game when the page is loaded - before that, we don't have the divs to work with (they are not rendered yet).
  // Create the initial state of the game - generate the divs with leftColumnValues and rightColumnValues in HTML.
  setupRound(state, shuffledLeftValRightValGlossary, pairsToRenderCount);
  starTimer(state);
});

// module.exports = {
//   shuffleArray,
//   createLeftColValRightColValGlossaryTriplets,
//   formatTime,
// }
