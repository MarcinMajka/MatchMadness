import { startTimer, stopTimer } from './timer.js';

const ANIMATION_DURATION = 250;

// NOTE: we are storing the clicked divs in an object, so we have the reactiveness of the object - the values will be updated in the object, even if we pass the object to a function.
const initialState = {
  columnElements: {
    leftColumnElementValueClicked: null,
    rightColumnElementValueClicked: null,
  },
  // keep track of the last used pair
  lastUsedTripletIndex: 0,
  foundPairs: 0,
  gameStartTime: null,
  timerInterval: null,
  currentSet: null,
  pairsToRender: null,
};

// Wrappers -------------------------------------------------------------------
const startGame = (initialState) => {
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      fetch('dicIn50WordSets.json')
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              'Network response was not ok ' + response.statusText
            );
          }
          return response.json();
        })
        .then((data) => {
          const wordSets = data;
          const setIndex = localStorage.getItem('setIndex') || 0;
          const pairsToRender = localStorage.getItem('pairsToRender') || 5;

          let state = {
            ...initialState,
            currentSet: shuffleArray(wordSets[setIndex]),
            pairsToRender,
          };
          setupRound(state, state.pairsToRender);
          startTimer(state);
        })
        .catch((error) => console.error('Error fetching wordSets:', error));
    });
  }
};

export const getElement = (selector) => {
  return document.querySelector(selector);
};

const addElement = (elementType) => {
  const element = document.createElement(elementType);
  return element;
};
// ----------------------------------------------------------------------------

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

const getValuesForRound = (state, pairRenderLimitIndex) => {
  const columnElementNodes = {
    left: [],
    right: [],
  };

  const prepareNodeForGame = (text) => {
    const node = addElement('div');
    node.classList.add('box');
    node.innerText = text;

    return node;
  };

  while (state.lastUsedTripletIndex < pairRenderLimitIndex) {
    const leftColumnElement = prepareNodeForGame(
      state.currentSet[state.lastUsedTripletIndex][0]
    );
    const rightColumnElement = prepareNodeForGame(
      state.currentSet[state.lastUsedTripletIndex][1]
    );

    columnElementNodes.left.push(leftColumnElement);
    columnElementNodes.right.push(rightColumnElement);

    state.lastUsedTripletIndex++;
  }

  shuffleArray(columnElementNodes.left);
  shuffleArray(columnElementNodes.right);

  return columnElementNodes;
};

const appendValuesToColumns = (state, columnElementNodes) => {
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

/**
 * Dynamically create the divs for leftColumnValues and rightColumnValues and append them to the HTML.
 * @param  pairRenderLimitIndex - index of the last pair to render + 1
 */
const setupRound = (state, pairRenderLimitIndex) => {
  const columnElementNodes = getValuesForRound(state, pairRenderLimitIndex);
  appendValuesToColumns(state, columnElementNodes);
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

const addSelectedClassToClickedElement = (state, clickedElement, className) => {
  if (className == 'leftColumn') {
    state.columnElements.leftColumnElementValueClicked = clickedElement;
    state.columnElements.leftColumnElementValueClicked.classList.add(
      'selected'
    );
  } else {
    state.columnElements.rightColumnElementValueClicked = clickedElement;
    state.columnElements.rightColumnElementValueClicked.classList.add(
      'selected'
    );
  }
};

const handleColumnElementClick = (state, clickedElement, selectedColumn) => {
  if (selectedColumn) {
    if (state.columnElements.leftColumnElementValueClicked === null) {
      addSelectedClassToClickedElement(state, clickedElement, 'leftColumn');
    } else {
      state.columnElements.leftColumnElementValueClicked.classList.remove(
        'selected'
      );
      addSelectedClassToClickedElement(state, clickedElement, 'leftColumn');
    }
  } else {
    if (state.columnElements.rightColumnElementValueClicked === null) {
      addSelectedClassToClickedElement(state, clickedElement, 'rightColumn');
    } else {
      state.columnElements.rightColumnElementValueClicked.classList.remove(
        'selected'
      );
      addSelectedClassToClickedElement(state, clickedElement, 'rightColumn');
    }
  }
};

const handleCorrectAnswer = (
  state,
  leftColumnElementValue,
  rightColumnElementValue,
  tripletIndex
) => {
  highlightElements(
    [
      state.columnElements.leftColumnElementValueClicked,
      state.columnElements.rightColumnElementValueClicked,
    ],
    'correct'
  );

  const leftValueRightValue = getElement('#leftValueRightValue');
  const glossary = getElement('#glossary');
  leftValueRightValue.innerHTML = `${leftColumnElementValue} - ${rightColumnElementValue}:`;
  glossary.innerHTML = state.currentSet[tripletIndex][2];

  // assigning leftColumnElementValueClicked and rightColumnElementValueClicked to different values, so that the User can select other divs during the animation
  const leftElementToRemove =
    state.columnElements.leftColumnElementValueClicked;
  const rightElementToRemove =
    state.columnElements.rightColumnElementValueClicked;

  clearClickedElements(state);

  // Remove the elements after a short delay.
  setTimeout(() => {
    removeElements([leftElementToRemove, rightElementToRemove], 'correct');

    state.foundPairs++;

    updateUIIfRoundFinished(state);
  }, ANIMATION_DURATION);
};

const handleIncorrectAnswer = (state) => {
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
  clearClickedElements(state);
};

const clearClickedElements = (state) => {
  state.columnElements.leftColumnElementValueClicked = null;
  state.columnElements.rightColumnElementValueClicked = null;
};

const getTripletIndexAndExpectedRightColumnElementValue = (
  state,
  leftColumnElementValue,
  rightColumnElementValue
) => {
  let tripletIndex = null;
  let expectedRightColumnValue = null;

  for (
    let i = state.lastUsedTripletIndex - state.pairsToRender;
    i < state.lastUsedTripletIndex;
    i++
  ) {
    if (
      leftColumnElementValue === state.currentSet[i][0] &&
      rightColumnElementValue === state.currentSet[i][1]
    ) {
      tripletIndex = i;
      expectedRightColumnValue = state.currentSet[i][1];
      break;
    }
  }

  return [tripletIndex, expectedRightColumnValue];
};

const handleColumnElementComparison = (state) => {
  const leftColumnElementValue =
    state.columnElements.leftColumnElementValueClicked.innerHTML;
  const rightColumnElementValue =
    state.columnElements.rightColumnElementValueClicked.innerHTML;

  const [tripletIndex, expectedRightColumnValue] =
    getTripletIndexAndExpectedRightColumnElementValue(
      state,
      leftColumnElementValue,
      rightColumnElementValue
    );

  if (rightColumnElementValue === expectedRightColumnValue) {
    handleCorrectAnswer(
      state,
      leftColumnElementValue,
      rightColumnElementValue,
      tripletIndex
    );
  } else {
    handleIncorrectAnswer(state);
  }
};

/**
 *
 * @param {target} event - check if selected word and translation match.
 */

const checkIfMatch = (event, state) => {
  const clickedElement = event.target;

  // left or right column
  const clickedElementsParentElementsClass =
    clickedElement.parentElement.getAttribute('class');

  const elementFromLeftColumnIsSelected =
    clickedElementsParentElementsClass === 'leftColumn';

  handleColumnElementClick(
    state,
    clickedElement,
    elementFromLeftColumnIsSelected
  );

  const bothColumnsHaveSelectedElements =
    state.columnElements.leftColumnElementValueClicked !== null &&
    state.columnElements.rightColumnElementValueClicked !== null;

  if (bothColumnsHaveSelectedElements) {
    handleColumnElementComparison(state);
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

const updateUIIfRoundFinished = (state) => {
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

const roundIsFinished = (state) => {
  return state.foundPairs !== 0 && state.foundPairs % state.pairsToRender === 0;
};

startGame(initialState);

// module.exports = {
//   shuffleArray,
//   formatTime,
// };
