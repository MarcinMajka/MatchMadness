const wordMadnessWord = document.getElementById('word');
const wordMadnessInput = document.getElementById('userInput');
const wordMadnessGlossary = document.getElementById('glossary');
const matchesInSetButton = document.getElementById('matches');
const wrongCountInSetButton = document.getElementById('wrong');

const data = JSON.parse(localStorage.getItem('currentSet'));

/*
  Plan:
    1. get an object with kanjis that appear multiple times in one set
    2. get an object with kanjis and their readings in an array as values
    3. get an object with ALL kanjis from JMdict used
    4. find a way to store the object from #3 in the browser for further usage
*/

const getSameKanjiInSetObject = () => {
  const sameKanjiObject = {};

  // Count all occurrences
  data.forEach((element) => {
    const k = element.kanji;
    sameKanjiObject[k] = sameKanjiObject[k] + 1 || 1;
  });

  // Delete records with occurrences of 1
  data.forEach((element) => {
    const k = element.kanji;
    if (sameKanjiObject[k] === 1) {
      delete sameKanjiObject[k];
    }
  });

  return sameKanjiObject;
};

window.getSameKanjiInSetObject = getSameKanjiInSetObject;

let wordIndex = 0;
let currentSetMatchCount = 0;
let wrongCountInSet = 0;

function validateInput(e) {
  if (e.code === 'Space' || e.code === 'Enter') {
    const inputMatchesReading =
      wordMadnessInput.value.trim() === data[wordIndex - 1].reading;
    const inputMatchesKanji =
      wordMadnessInput.value.trim() === data[wordIndex - 1].kanji;
    if (inputMatchesReading || inputMatchesKanji) {
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
  console.log(data[wordIndex]);
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
