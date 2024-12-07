// script.js
const gameBoard = document.getElementById('game-board');

// Card data (can be customized)
const symbols = ['🍎', '🍌', '🍒', '🍇', '🍍', '🥝', '🍓', '🍉'];
let cards = [...symbols, ...symbols]; // Duplicates for matching pairs

// Track flipped cards and matched pairs
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

// Check if two flipped cards match
function checkForMatch() {
  const [card1, card2] = flippedCards;

  if (card1.dataset.symbol === card2.dataset.symbol) {
    // Match found
    card1.classList.add('matched');
    card2.classList.add('matched');
    matchedPairs++;

    // Check if the game is won
    if (matchedPairs === symbols.length) {
      setTimeout(() => alert('You Win!'), 500);
    }
  } else {
    // No match, flip cards back after a delay
    setTimeout(() => {
      card1.textContent = '';
      card2.textContent = '';
      card1.classList.remove('flipped');
      card2.classList.remove('flipped');
    }, 1000);
  }

  // Reset flipped cards array
  flippedCards = [];
}
