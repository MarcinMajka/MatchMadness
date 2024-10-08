import { getElement } from './wrappers.js';
import { stopTimer } from './timer.js';
import {
  checkIfMatch,
  roundIsFinished,
  getValuesForRound,
} from './matchMadness.js';
import { compareThreeWords } from './favoriteWords.js';

export const ANIMATION_DURATION = 250;

/**
 * Dynamically create the divs for leftColumnValues and rightColumnValues and append them to the HTML.
 * @param  pairRenderLimitIndex - index of the last pair to render + 1
 */
export const setupRound = (state, pairRenderLimitIndex) => {
  const columnElementNodes = getValuesForRound(state, pairRenderLimitIndex);
  appendValuesToColumns(state, columnElementNodes);
};

/**
 * Highlight the elements for a short period of time by adding a class to them and then removing it after a timeout.
 * @param elements - an array of DOM elements
 * @param className - the class to add and then remove
 */
export const highlightElements = (elements, className) => {
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
};

/**
 *
 * @param elements - array of elements to remove, or to remove the "selected" class
 * @param correctOrWrong - string of the class name of the element to remove -> "correct" or "wrong"
 */

export const removeElements = (elements, correctOrWrong) => {
  if (correctOrWrong === 'correct') {
    elements.forEach((element) => element.remove());
  } else {
    elements.forEach((element) => element.classList.remove('selected'));
  }
};

export const selectElement = (state, clickedElement, className) => {
  if (className == 'leftColumn') {
    state.clickedColumnElements.left = clickedElement;
    state.clickedColumnElements.left.classList.add('selected');
  } else {
    state.clickedColumnElements.right = clickedElement;
    state.clickedColumnElements.right.classList.add('selected');
  }
};

export const updateUIIfRoundFinished = (state) => {
  const setLength = state.currentSet.length;
  const isWin = state.foundPairs == setLength;
  const isCurrentRoundOver = roundIsFinished(state);
  const shouldSetupNextRound = isCurrentRoundOver && !isWin;

  if (shouldSetupNextRound) {
    const remainingPairs = setLength - state.lastUsedTripletIndex;
    const nextPairsToRender = Math.min(state.pairsToRender, remainingPairs);

    setupRound(state, state.lastUsedTripletIndex + nextPairsToRender);
  }

  if (isWin) {
    // Make buttons visible and actionable
    const buttons = getElement('.buttonContainer');
    buttons.style.visibility = 'visible';
    stopTimer(state);
  }
};

export const appendValuesToColumns = (state, columnElementNodes) => {
  const columns = {
    left: getElement('.leftColumn'),
    right: getElement('.rightColumn'),
  };

  for (let i = 0; i < columnElementNodes.left.length; i++) {
    columns.left.appendChild(columnElementNodes.left[i]);
    columns.right.appendChild(columnElementNodes.right[i]);

    columnElementNodes.left[i].addEventListener('click', (event) =>
      checkIfMatch(event, state)
    );
    columnElementNodes.right[i].addEventListener('click', (event) =>
      checkIfMatch(event, state)
    );
  }
};

export const updateGlossary = (state) => {
  const kanji = state.currentCorrectWord.kanji;
  const reading = state.currentCorrectWord.reading;
  const glossary = state.currentCorrectWord.glossary;

  const leftValueRightValue = getElement('#leftValueRightValue');
  const glossaryElement = getElement('#glossary');
  leftValueRightValue.innerHTML = `${kanji} - ${reading}:`;
  glossaryElement.innerHTML = glossary;

  compareThreeWords(kanji, reading, glossary)
    .then((result) => {
      if (result) {
        likeButton.classList.add('liked');
      } else {
        likeButton.classList.remove('liked');
        console.log('unliked');
      }
    })
    .catch((error) => {
      console.error('Error in compareThreeWords:', error);
    });
};

export const likeButton = getElement('#likeButton');
export const toggleLike = (element) => {
  element.classList.toggle('liked');
};

export const showLikeButton = () => {
  likeButton.style.visibility = 'visible';
};
