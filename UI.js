import { addElement, getElement, setTimeoutWrapper } from './wrappers.js';
import { stopTimer } from './timer.js';
import { checkIfMatch, roundIsFinished } from './matchMadness.js';
import { compareThreeWords } from './favoriteWords.js';
import { shuffleArray } from './utils.js';

// Helper function to create an empty box
const createEmptyBox = () => {
  const node = addElement('div');
  node.classList.add('box');
  return node;
};

const createEmptyBoxes = (state, pairRenderLimitIndex) => {
  const columnElementNodes = {
    left: [],
    right: [],
  };

  const boxCount = pairRenderLimitIndex - state.lastUsedTripletIndex;

  for (let i = 0; i < boxCount; i++) {
    columnElementNodes.left.push(createEmptyBox());
    columnElementNodes.right.push(createEmptyBox());
  }

  return columnElementNodes;
};

const appendBoxesToColumns = (state, columnElementNodes) => {
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

const fillBoxesWithValues = (
  state,
  columnElementNodes,
  pairRenderLimitIndex
) => {
  const leftValues = [];
  const rightValues = [];

  while (state.lastUsedTripletIndex < pairRenderLimitIndex) {
    leftValues.push(state.currentSet[state.lastUsedTripletIndex].kanji);
    rightValues.push(state.currentSet[state.lastUsedTripletIndex].reading);
    state.lastUsedTripletIndex++;
  }

  shuffleArray(leftValues);
  shuffleArray(rightValues);

  for (let i = 0; i < columnElementNodes.left.length; i++) {
    columnElementNodes.left[i].innerText = leftValues[i];
    columnElementNodes.right[i].innerText = rightValues[i];
  }
};

export const setupRound = (state, pairRenderLimitIndex) => {
  const columnElementNodes = createEmptyBoxes(state, pairRenderLimitIndex);
  appendBoxesToColumns(state, columnElementNodes);
  fillBoxesWithValues(state, columnElementNodes, pairRenderLimitIndex);
};

const clearUpAfterRound = (elements) => {
  elements.forEach((element) => {
    element.innerHTML = '';
  });
};

/**
 * Highlight the elements for a short period of time by adding a class to them and then removing it after a timeout.
 * @param elements - an array of DOM elements
 * @param className - the class to add and then remove
 * @param animationDuration - highlight duration
 */
export const highlightElements = (elements, className, animationDuration) => {
  // Highlighted elements should be disabled during the animation
  elements.forEach((element) => {
    element.classList.add(className);
    element.style.pointerEvents = 'none';
  });
  setTimeoutWrapper(() => {
    elements.forEach((element) => {
      element.classList.remove(className);
      element.style.pointerEvents = '';
    });
  }, animationDuration);
};

/**
 *
 * @param elements - array of elements to grey out, or to remove the "selected" class
 * @param correctOrWrong - string of the class name of the element to update1 -> "correct" or "wrong"
 */

export const updateElements = (elements, correctOrWrong) => {
  if (correctOrWrong === 'correct') {
    elements.forEach((element) => element.classList.add('done'));
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
    const elements = [getElement('.leftColumn'), getElement('.rightColumn')];
    clearUpAfterRound(elements);

    const remainingPairs = setLength - state.lastUsedTripletIndex;
    const nextPairsToRender = Math.min(state.pairsToRender, remainingPairs);

    setupRound(state, state.lastUsedTripletIndex + nextPairsToRender);
  }

  if (isWin) {
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
      const likeButton = getElement('#matchMadnessLikeButton');

      if (result) {
        likeButton.classList.add('liked');
      } else {
        likeButton.classList.remove('liked');
      }
    })
    .catch((error) => {
      console.error('Error in compareThreeWords:', error);
    });
};

export const displayMatches = (matchesElement, matchCount) => {
  matchesElement.innerText = `${matchCount}`;
};

export const displayFailedTries = (failsElement, failCount) => {
  failsElement.innerText = `Fails: ${failCount}`;
};

export const toggleLike = (element) => {
  element.classList.toggle('liked');
};

export const showElement = (element) => {
  element.style.visibility = 'visible';
};
