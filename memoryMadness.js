// script.js
import { isKanji } from 'https://unpkg.com/wanakana@5.3.1/esm/index.js';
import { highlightElements } from './UI.js';
import { setTimeoutWrapper } from './wrappers.js';

const ANIMATION_DURATION = 1000;

const gameBoard = document.getElementById('game-board');

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
let cards = [...kanjis, ...readings];

let flippedCards = [];
let matchedPairs = 0;

// Create and display cards
cards.forEach((symbol) => {
  const card = document.createElement('div');
  card.classList.add('card');
  card.dataset.symbol = symbol; // Store symbol as data attribute
  card.addEventListener('click', handleCardClick);
  gameBoard.appendChild(card);
});

// Handle card click
function handleCardClick(event) {
  const card = event.target;

  // Ignore already matched or flipped cards
  if (
    card.classList.contains('flipped') ||
    card.classList.contains('matched')
  ) {
    return;
  }

  // Flip the card
  card.textContent = card.dataset.symbol;
  card.classList.add('flipped');
  flippedCards.push(card);

  // Check for a match if two cards are flipped
  if (flippedCards.length === 2) {
    checkForMatch();
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
function checkForMatch() {
  const [card1, card2] = flippedCards;

  if (isMatch(card1, card2)) {
    // Match found
    highlightElements([card1, card2], 'correct', ANIMATION_DURATION);

    setTimeoutWrapper(() => {
      card1.classList.add('matched');
      card2.classList.add('matched');
    }, ANIMATION_DURATION);

    matchedPairs++;

    // Check if the game is won
    if (matchedPairs === data.length) {
      setTimeoutWrapper(() => alert('You Win!'), 500);
    }
  } else {
    // No match
    card1.classList.remove('flipped');
    card2.classList.remove('flipped');
    highlightElements([card1, card2], 'wrong', ANIMATION_DURATION);

    // Flip cards back after a delay
    setTimeoutWrapper(() => {
      card1.textContent = '';
      card2.textContent = '';
    }, ANIMATION_DURATION);
  }

  flippedCards = [];
}

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

const currentSetMap = JSON.stringify(generateKanjisToHiraganasMap(data));
localStorage.setItem('currentSetMap', currentSetMap);

console.log(localStorage.getItem('currentSetMap'));
