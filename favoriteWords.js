import { getElement } from './wrappers.js';

let db;

const request = indexedDB.open('FavoriteWords', 1);

request.onerror = (event) => {
  console.error('Database error: ' + event.target.error);
};

request.onsuccess = (event) => {
  db = event.target.result;
  console.log('Database opened successfully');
};

request.onupgradeneeded = (event) => {
  db = event.target.result;
  const objectStore = db.createObjectStore('favWords', {
    keyPath: 'id',
    autoIncrement: true,
  });
  objectStore.createIndex('kanji', 'kanji', { unique: false });
  objectStore.createIndex('reading', 'reading', { unique: false });
  objectStore.createIndex('glossary', 'glossary', { unique: false });
  console.log('Object store created');
};

export const addWord = (kanji, reading, glossary) => {
  const transaction = db.transaction(['favWords'], 'readwrite');
  const objectStore = transaction.objectStore('favWords');
  const request = objectStore.add({
    kanji,
    reading,
    glossary,
  });

  request.onsuccess = () => {
    console.log('Item added successfully');
  };

  request.onerror = (event) => {
    console.error('Error adding item: ' + event.target.error);
  };
};

export const getWordByKey = (key, val) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['favWords'], 'readonly');
    const objectStore = transaction.objectStore('favWords');
    const index = objectStore.index(key);
    const request = index.get(val);

    request.onsuccess = (event) => {
      if (request.result) {
        console.log(`Item by ${key} found:`, request.result);
        resolve(request.result);
      } else {
        console.log('Item not found');
        resolve(null);
      }
    };

    request.onerror = (event) => {
      console.error('Error getting item: ' + event.target.error);
      reject(event.target.error);
    };
  });
};

export async function compareThreeWords(
  kanjiValue,
  readingValue,
  glossaryValue
) {
  try {
    const [kanjiResult, readingResult, glossaryResult] = await Promise.all([
      getWordByKey('kanji', kanjiValue),
      getWordByKey('reading', readingValue),
      getWordByKey('glossary', glossaryValue),
    ]);

    if (!kanjiResult) {
      console.log('Not in the database');
      return false;
    }

    if (
      kanjiResult.kanji === readingResult.kanji &&
      kanjiResult.kanji === glossaryResult.kanji
    ) {
      console.log('Comparison successful, returning true');
      return true;
    } else {
      console.log('Comparison failed, returning false');
      return false;
    }
  } catch (error) {
    console.error('Error comparing words:', error);
    return false;
  }
}

// This makes these functions callable in the console
window.addWord = function (kanji, reading, glossary) {
  addWord(kanji, reading, glossary);
};

window.getWordByKey = function (key, val) {
  getWordByKey(key, val);
};

export const getFavoriteWordData = (
  kanjiSelector,
  readingSelector,
  glossarySelector
) => {
  const kanji = kanjiSelector.value;
  const reading = readingSelector.value;
  const glossary = glossarySelector.value;
  return [kanji, reading, glossary];
};

export const addClickListenerToLikeButton = (
  kanjiSelector,
  readingSelector,
  glossarySelector
) => {
  const likeButton = getElement('#likeButton');
  likeButton.addEventListener('click', () => {
    const [kanji, reading, glossary] = getFavoriteWordData(
      kanjiSelector,
      readingSelector,
      glossarySelector
    );
    addWord(kanji, reading, glossary);
  });
};

function initializeFavoriteWords() {
  const kanjiSelector = getElement('#favKanji');
  const readingSelector = getElement('#favReading');
  const glossarySelector = getElement('#favGlossary');

  // Safety net for not throwing errors when not on addFavorites.html
  if (kanjiSelector && readingSelector && glossarySelector) {
    addClickListenerToLikeButton(
      kanjiSelector,
      readingSelector,
      glossarySelector
    );
  }
}

initializeFavoriteWords();
