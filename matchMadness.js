import { startTimer } from './timer.js';
import { shuffleArray } from './utils.js';
import { getElement, addElement, setTimeoutWrapper } from './wrappers.js';
import {
  ANIMATION_DURATION,
  highlightElements,
  selectElement,
  removeElements,
  updateUIIfRoundFinished,
  setupRound,
  updateGlossary,
  showLikeButton,
} from './UI.js';

// NOTE: we are storing the clicked divs in an object, so we have the reactiveness of the object - the values will be updated in the object, even if we pass the object to a function.
const initialState = {
  clickedColumnElements: {
    left: null,
    right: null,
  },
  // keep track of the last used pair
  lastUsedTripletIndex: 0,
  foundPairs: 0,
  gameStartTime: null,
  timerInterval: null,
  currentSet: null,
  pairsToRender: null,
  currentCorrectWord: {
    kanji: null,
    reading: null,
    glossary: null,
  },
};

const loadGamePreferences = () => {
  const currentSet = JSON.parse(localStorage.getItem('currentSet')) || 0;
  const pairsToRender = localStorage.getItem('pairsToRender') || 5;

  return { currentSet: shuffleArray(currentSet), pairsToRender };
};

const startGame = (initialState) => {
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      let state = {
        ...initialState,
        ...loadGamePreferences(),
      };
      setupRound(state, state.pairsToRender);
      startTimer(state);
    });
  }
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
      state.currentSet[state.lastUsedTripletIndex].kanji
    );
    const rightColumnElement = prepareNodeForGame(
      state.currentSet[state.lastUsedTripletIndex].reading
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
    if (state.clickedColumnElements.left === null) {
      selectElement(state, clickedElement, 'leftColumn');
    } else {
      state.clickedColumnElements.left.classList.remove('selected');
      selectElement(state, clickedElement, 'leftColumn');
    }
  } else {
    if (state.clickedColumnElements.right === null) {
      selectElement(state, clickedElement, 'rightColumn');
    } else {
      state.clickedColumnElements.right.classList.remove('selected');
      selectElement(state, clickedElement, 'rightColumn');
    }
  }
};

export const clearClickedElements = (state) => {
  state.clickedColumnElements.left = null;
  state.clickedColumnElements.right = null;
};

const handleCorrectAnswer = (state) => {
  highlightElements(
    [state.clickedColumnElements.left, state.clickedColumnElements.right],
    'correct'
  );

  updateGlossary(state);

  showLikeButton();

  // assigning left and right to different values, so that the User can select other divs during the animation
  const leftElementToRemove = state.clickedColumnElements.left;
  const rightElementToRemove = state.clickedColumnElements.right;

  clearClickedElements(state);

  // Remove the elements after a short delay.
  setTimeoutWrapper(() => {
    removeElements([leftElementToRemove, rightElementToRemove], 'correct');

    state.foundPairs++;

    updateUIIfRoundFinished(state);
  }, ANIMATION_DURATION);
};

const handleIncorrectAnswer = (state) => {
  highlightElements(
    [state.clickedColumnElements.left, state.clickedColumnElements.right],
    'wrong'
  );

  // Reset the "selected" styles on the unmached elements...
  removeElements(
    [state.clickedColumnElements.left, state.clickedColumnElements.right],
    'wrong'
  );

  // And reset the references
  clearClickedElements(state);
};

// TODO: maybe could be changed now to check keyVal pairs instead of this loop?
const getTripletIndex = (
  state,
  leftColumnElementValue,
  rightColumnElementValue
) => {
  let tripletIndex = null;

  for (
    let i = state.lastUsedTripletIndex - state.pairsToRender;
    i < state.lastUsedTripletIndex;
    i++
  ) {
    if (
      leftColumnElementValue === state.currentSet[i].kanji &&
      rightColumnElementValue === state.currentSet[i].reading
    ) {
      tripletIndex = i;
      break;
    }
  }

  return tripletIndex;
};

const getExpectedRightColumnValue = (state, tripletIndex) => {
  return state.currentSet[tripletIndex]
    ? state.currentSet[tripletIndex].reading
    : 'false';
};

const handleColumnElementComparison = (state) => {
  const leftColumnElementValue = state.clickedColumnElements.left.innerHTML;
  const rightColumnElementValue = state.clickedColumnElements.right.innerHTML;

  const tripletIndex = getTripletIndex(
    state,
    leftColumnElementValue,
    rightColumnElementValue
  );
  const expectedRightColumnValue = getExpectedRightColumnValue(
    state,
    tripletIndex
  );

  if (rightColumnElementValue === expectedRightColumnValue) {
    state.currentCorrectWord = {
      kanji: leftColumnElementValue,
      reading: rightColumnElementValue,
      glossary: state.currentSet[tripletIndex].glossary,
    };

    handleCorrectAnswer(state);
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
    state.clickedColumnElements.left !== null &&
    state.clickedColumnElements.right !== null;

  if (bothColumnsHaveSelectedElements) {
    handleColumnElementComparison(state);
  }
};

export const roundIsFinished = (state) => {
  return state.foundPairs !== 0 && state.foundPairs % state.pairsToRender === 0;
};

startGame(initialState);