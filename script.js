import { startTimer, stopTimer } from './timer.js';
import { getElement, addElement } from './wrappers.js';
import {
  ANIMATION_DURATION,
  highlightElements,
  clearClickedElements,
  selectElement,
  removeElements,
  updateUIIfRoundFinished,
  setupRound,
} from './UI.js';

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

const startGame = (initialState) => {
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      const currentSet = JSON.parse(localStorage.getItem('currentSet'));
      const pairsToRender = localStorage.getItem('pairsToRender') || 5;

      let state = {
        ...initialState,
        currentSet: shuffleArray(currentSet),
        pairsToRender,
      };
      setupRound(state, state.pairsToRender);
      startTimer(state);
    });
  }
};

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

export const getValuesForRound = (state, pairRenderLimitIndex) => {
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

const handleColumnElementClick = (state, clickedElement, selectedColumn) => {
  if (selectedColumn) {
    if (state.columnElements.leftColumnElementValueClicked === null) {
      selectElement(state, clickedElement, 'leftColumn');
    } else {
      state.columnElements.leftColumnElementValueClicked.classList.remove(
        'selected'
      );
      selectElement(state, clickedElement, 'leftColumn');
    }
  } else {
    if (state.columnElements.rightColumnElementValueClicked === null) {
      selectElement(state, clickedElement, 'rightColumn');
    } else {
      state.columnElements.rightColumnElementValueClicked.classList.remove(
        'selected'
      );
      selectElement(state, clickedElement, 'rightColumn');
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

export const checkIfMatch = (event, state) => {
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

export const roundIsFinished = (state) => {
  return state.foundPairs !== 0 && state.foundPairs % state.pairsToRender === 0;
};

startGame(initialState);

// module.exports = {
//   shuffleArray,
// };
