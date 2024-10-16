const wordMadnessWord = document.getElementById('word');
const wordMadnessInput = document.getElementById('userInput');
const wordMadnessGlossary = document.getElementById('glossary');
const matchesInSetButton = document.getElementById('matches');
const wrongCountInSetButton = document.getElementById('wrong');

const data = JSON.parse(localStorage.getItem('currentSet'));

let wordIndex = 0;
let currentSetMatchCount = 0;
let wrongCountInSet = 0;

function validateInput(e) {
  if (e.code === 'Space' || e.code === 'Enter') {
    if (wordMadnessInput.value.trim() === wordMadnessWord.innerText) {
      currentSetMatchCount++;
      updateGlossary();
      updateWord();
    } else {
      //   If input is blank, let's not count it towards fails
      if (wordMadnessInput.value === '') return;
      wrongCountInSet++;
      displayFailedTries();
    }
  }
}

function updateWord() {
  displayMatches();
  if (wordIndex < data.length) {
    wordMadnessWord.innerText = data[wordIndex].kanji;
    wordMadnessInput.value = '';
    wordIndex++;
  } else {
    wordIndex = 0;
    currentSetMatchCount = 0;
    if (wordIndex === data.length) {
      updateWord();
    } else {
      alert('Congrats!');
    }
  }
}

function updateGlossary() {
  wordMadnessGlossary.innerText = `${data[wordIndex - 1][0]} - ${
    data[wordIndex - 1][0]
  }\n ${data[wordIndex - 1][2]}\n ${data[wordIndex - 1][2]}`;
}

function displayMatches() {
  const currentSetLenght = data.length;
  matchesInSetButton.innerText = `${currentSetMatchCount}/${currentSetLenght}`;
}

function displayFailedTries() {
  wrongCountInSetButton.innerText = `Fails: ${wrongCountInSet}`;
}

wordMadnessInput.addEventListener('keyup', validateInput);
wordMadnessInput.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
  }
});

window.addEventListener('load', () => {
  updateWord();
  wordMadnessInput.focus();
  displayMatches();
  displayFailedTries();
});
