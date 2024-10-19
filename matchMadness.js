import { startTimer } from './timer.js';
import { shuffleArray } from './utils.js';
import { addWord, deleteRecord } from './favoriteWords.js';
import { setTimeoutWrapper } from './wrappers.js';
import {
  ANIMATION_DURATION,
  highlightElements,
  selectElement,
  updateElements,
  updateUIIfRoundFinished,
  setupRound,
  updateGlossary,
  showLikeButton,
  likeButton,
  toggleLike,
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
  let pairsToRender = Math.min(
    Math.max(
      // Get the value from localStorage, or use '7' if not set
      Math.min(
        localStorage.getItem('pairsToRender') || 5,
        // Ensure the value doesn't exceed 7
        7
      ),
      // Ensure the value is at least 3
      3
    ),
    // Finally, ensure the value doesn't exceed the length of currentSet
    currentSet.length
  );

  // At this point, pairsToRender will be:
  // 1. Between 3 and 7 (inclusive) if currentSet.length > 7
  // 2. Between 3 and currentSet.length (inclusive) if 3 <= currentSet.length <= 7
  // 3. Equal to currentSet.length if currentSet.length < 3

  return { currentSet: shuffleArray(currentSet), pairsToRender };
};

const handleLikeButton = (state) => {
  likeButton.addEventListener('click', (event) => {
    const wordIsLiked = event.target.classList.contains('liked');
    if (wordIsLiked) {
      console.log('REMOVING word');
      toggleLike(likeButton);
      deleteRecord(state);
    } else {
      console.log('ADDING word');
      toggleLike(likeButton);
      addWord(
        state.currentCorrectWord.kanji,
        state.currentCorrectWord.reading,
        state.currentCorrectWord.glossary
      );
    }
  });
};

const startGame = (initialState) => {
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      let state = {
        ...initialState,
        ...loadGamePreferences(),
      };

      handleLikeButton(state);

      setupRound(state, state.pairsToRender);
      startTimer(state);
    });
  }
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
    updateElements([leftElementToRemove, rightElementToRemove], 'correct');

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
  updateElements(
    [state.clickedColumnElements.left, state.clickedColumnElements.right],
    'wrong'
  );

  // And reset the references
  clearClickedElements(state);
};

// NOTE; current implementation works for Match Madness, because if there are multiple
// readings for the same kanji present, all the readings are present too.
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
