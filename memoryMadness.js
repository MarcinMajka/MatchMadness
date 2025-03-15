// script.js
import { isKanji } from 'https://unpkg.com/wanakana@5.3.1/esm/index.js';
import {
  highlightElements,
  handleCompareThreeWordsResult,
  toggleLike,
  displayFailedTries,
} from './UI.js';
import { setTimeoutWrapper, getElement } from './wrappers.js';
import { shuffleArray, containsClass, addClass, removeClass } from './utils.js';
import { compareThreeWords, addWord, deleteRecord } from './favoriteWords.js';

const ANIMATION_DURATION = 1000;

const elements = {
  gameBoard: getElement('#game-board'),
  glossary: getElement('#glossary'),
  matches: getElement('#matches'),
  wrong: getElement('#wrong'),
  glossaryWordAndReading: getElement('#leftValueRightValue'),
  likeButton: getElement('#memoryMadnessLikeButton'),
};

const gameState = {
  flippedCards: [],
  // 2d matrix for checking if a pair of cards was flipped once,
  // so next time they're wrong it counts as a failed try
  checkedCards: new Array(100).fill(false),
  matchedPairs: 0,
  wrong: 0,
};

// Card data (can be customized)
const data = JSON.parse(localStorage.getItem('currentSet'));
const kanjis = [];
const readings = [];
const kanjiToReadings = generateKanjisToHiraganasMap(data);
data.map((word) => {
  const kanji = word.kanji;
  const reading = word.reading;
  kanjis.push(kanji);
  readings.push(reading);
});
// let cards = [...kanjis, ...readings];
let cards = shuffleArray([...kanjis, ...readings]);

let cardId = 0;

// Create and display cards
cards.forEach((symbol) => {
  const card = document.createElement('div');
  addClass(card, 'card');
  card.dataset.cardId = cardId++;
  card.dataset.symbol = symbol; // Store symbol as data attribute
  card.addEventListener('click', handleCardClick);
  elements.gameBoard.appendChild(card);
});

elements.matches.textContent = gameState.matchedPairs;
displayFailedTries(elements.wrong, gameState.wrong);

function handleCardClick(event) {
  const card = event.target;

  // Ignore already matched or flipped cards
  if (shouldIgnoreCard(card)) {
    return;
  }

  flipCard(card);

  // Check for a match if two cards are flipped
  if (gameState.flippedCards.length === 2) {
    const [card1, card2] = gameState.flippedCards;
    checkForMatch(card1, card2);
  }
}

const isCardKanji = (card) => {
  const word = card.dataset.symbol;
  const wordChars = word.split('');
  const isCardKanji = wordChars.some((char) => isKanji(char));
  return isCardKanji;
};

const isPotentialCardPair = (card1, card2) => {
  return (
    (isCardKanji(card1) && !isCardKanji(card2)) ||
    (isCardKanji(card2) && !isCardKanji(card1))
  );
};

// To be used after checking isPotentialCardPair
const getKanjiAndReading = (card1, card2) => {
  return isCardKanji(card1) ? [card1, card2] : [card2, card1];
};

const isMatch = (card1, card2) => {
  if (isPotentialCardPair(card1, card2)) {
    let [kanji, reading] = getKanjiAndReading(card1, card2);
    kanji = kanji.dataset.symbol;
    reading = reading.dataset.symbol;
    return kanjiToReadings[kanji].some((el) => el === reading);
  }
  return false;
};

// Check if two flipped cards match
function checkForMatch(card1, card2) {
  if (isMatch(card1, card2)) {
    highlightElements([card1, card2], 'correct', ANIMATION_DURATION);

    setTimeoutWrapper(() => {
      addClass(card1, 'matched');
      addClass(card2, 'matched');
    }, ANIMATION_DURATION);

    let [kanji, reading] = getKanjiAndReading(card1, card2);
    kanji = kanji.dataset.symbol;
    reading = reading.dataset.symbol;
    elements.glossaryWordAndReading.textContent = `${kanji} - ${reading}`;

    const glossary = getGlossary(kanji, reading);
    elements.glossary.textContent = glossary;

    const lb = elements.likeButton;
    lb.style.visibility = 'visible';

    compareThreeWords(kanji, reading, glossary).then((result) => {
      handleCompareThreeWordsResult(result, elements.likeButton);
    });

    gameState.matchedPairs++;
    elements.matches.textContent = gameState.matchedPairs;

    lb.addEventListener('click', (event) => {
      const wordIsLiked = event.target.classList.contains('liked');
      if (wordIsLiked) {
        deleteRecord({ kanji, reading, glossary });
      } else {
        addWord(kanji, reading, glossary);
      }
      toggleLike(lb);
    });

    // Check if the game is won
    if (gameState.matchedPairs === data.length) {
      setTimeoutWrapper(() => alert('You Win!'), 500);
    }
  } else {
    removeClass(card1, 'flipped');
    removeClass(card2, 'flipped');
    highlightElements([card1, card2], 'wrong', ANIMATION_DURATION);

    if (isCardMarkedAsVisited(card1) || isCardMarkedAsVisited(card2)) {
      gameState.wrong++;
    }

    markCardsAsVisited(card1, card2);

    // Flip cards back after a delay
    setTimeoutWrapper(() => {
      card1.textContent = '';
      card2.textContent = '';

      displayFailedTries(elements.wrong, gameState.wrong);
    }, ANIMATION_DURATION);
  }

  gameState.flippedCards = [];
}

function shouldIgnoreCard(card) {
  return containsClass(card, 'flipped') || containsClass(card, 'matched');
}

const flipCard = (card) => {
  card.textContent = card.dataset.symbol;
  addClass(card, 'flipped');
  gameState.flippedCards.push(card);
};

const isCardMarkedAsVisited = (card) => {
  return gameState.checkedCards[card.dataset.cardId];
};

const markCardsAsVisited = (card1, card2) => {
  gameState.checkedCards[card1.dataset.cardId] = true;
  gameState.checkedCards[card2.dataset.cardId] = true;
};

// Returns kanji: [hiragana1, hiragana2, hiragana3, ...] Object
function generateKanjisToHiraganasMap(currentSet) {
  const kanjiToHiraganas = {};
  for (const triplet of currentSet) {
    const kanji = triplet.kanji;
    const hiragana = triplet.reading;

    if (kanjiToHiraganas[kanji]) {
      kanjiToHiraganas[kanji].push(hiragana);
    } else {
      kanjiToHiraganas[kanji] = [hiragana];
    }
  }

  return kanjiToHiraganas;
}

const getGlossary = (kanji, reading) => {
  for (const triplet of data) {
    if (triplet.kanji === kanji && triplet.reading === reading) {
      return triplet.glossary;
    }
  }
};
