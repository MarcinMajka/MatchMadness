// script.js
import { isKanji } from 'https://unpkg.com/wanakana@5.3.1/esm/index.js';

const gameBoard = document.getElementById('game-board');

const symbols = ['🍎', '🍌', '🍒', '🍇', '🍍', '🥝', '🍓', '🍉'];
let cards = [...symbols, ...symbols]; // Duplicates for matching pairs

// Card data (can be customized)
const data = JSON.parse(localStorage.getItem('currentSet'));
const kanjis = [];
const readings = [];
const kanjiToReading = {};
data.map((word) => {
  const kanji = word.kanji;
  const reading = word.reading;
  kanjis.push(kanji);
  readings.push(reading);
  kanjiToReading[kanji] = reading;
});
let cardsJap = [...kanjis, ...readings];

// Track flipped cardsJap and matched pairs
let flippedCardsJap = [];
let matchedPairs = 0;

// Create and display cardsJap
cardsJap.forEach((symbol) => {
  const card = document.createElement('div');
  card.classList.add('card');
  card.dataset.symbol = symbol; // Store symbol as data attribute
  card.addEventListener('click', handleCardClick);
  gameBoard.appendChild(card);
});

// Handle card click
function handleCardClick(event) {
  const card = event.target;

  // Ignore already matched or flipped cardsJap
  if (
    card.classList.contains('flipped') ||
    card.classList.contains('matched')
  ) {
    return;
  }

  // Flip the card
  card.textContent = card.dataset.symbol;
  card.classList.add('flipped');
  flippedCardsJap.push(card);

  // Check for a match if two cardsJap are flipped
  if (flippedCardsJap.length === 2) {
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

const isMatch = (card1, card2) => {
  if (isPotentialCardPair(card1, card2)) {
    if (isCardKanji(card1)) {
      const kanji = card1.dataset.symbol;
      const reading = card2.dataset.symbol;
      return kanjiToReading[kanji] === reading;
    } else {
      const kanji = card2.dataset.symbol;
      const reading = card1.dataset.symbol;
      return kanjiToReading[kanji] === reading;
    }
  }
  return false;
};

// Check if two flipped cardsJap match
function checkForMatch() {
  const [card1, card2] = flippedCardsJap;

  if (isMatch(card1, card2)) {
    // Match found
    card1.classList.add('matched');
    card2.classList.add('matched');
    matchedPairs++;

    // Check if the game is won
    if (matchedPairs === symbols.length) {
      setTimeout(() => alert('You Win!'), 500);
    }
  } else {
    // No match, flip cardsJap back after a delay
    setTimeout(() => {
      card1.textContent = '';
      card2.textContent = '';
      card1.classList.remove('flipped');
      card2.classList.remove('flipped');
    }, 1000);
  }

  // Reset flipped cardsJap array
  flippedCardsJap = [];
}
