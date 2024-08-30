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

const addWord = (kanji, reading, glossary) => {
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

const getItemBykanji = (kanji) => {
  const transaction = db.transaction(['favWords'], 'readonly');
  const objectStore = transaction.objectStore('favWords');
  const index = objectStore.index('kanji');
  const request = index.get(kanji);

  request.onsuccess = (event) => {
    if (request.result) {
      console.log('Item found:', request.result);
    } else {
      console.log('Item not found');
    }
  };

  request.onerror = (event) => {
    console.error('Error getting item: ' + event.target.error);
  };
};

// This makes these functions callable in the console
window.addWord = function (kanji, reading, glossary) {
  addWord(kanji, reading, glossary);
};

window.getItemBykanji = function (kanji) {
  getItemBykanji(kanji);
};

const likeButton = getElement('#likeButton');
likeButton.addEventListener('click', () => {
  const kanjiToAdd = getElement('#favKanji').value.trim();
  const readingToAdd = getElement('#favReading').value.trim();
  const glossaryToAdd = getElement('#favGlossary').value.trim();
  addWord(kanjiToAdd, readingToAdd, glossaryToAdd);
});
