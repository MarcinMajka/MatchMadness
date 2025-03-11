import { getElement } from './wrappers.js';
import { fitTextToContainer } from './utils.js';
import {
  getAllWithIndex,
  openDatabase,
  deleteRecordDB,
  saveToIndexedDB,
  getAllAsAnArray,
} from './indexedDBHandler.js';

// Returns the selected collection value (not text) from the dropdown
const getCollectionName = () => {
  const e = getElement('#collection');
  const collection = e.options[e.selectedIndex].value;
  console.log('Collection:', collection);
  return collection;
};

const openFavWordsDatabase = async () => {
  const database = await openDatabase('FavoriteWords', 'favWords', {
    keyPath: 'id',
    autoIncrement: true,
    indexes: [
      { name: 'kanji', keyPath: 'kanji', options: { unique: false } },
      { name: 'reading', keyPath: 'reading', options: { unique: false } },
      { name: 'glossary', keyPath: 'glossary', options: { unique: false } },
    ],
  });

  return database;
};

export const addWord = async (kanji, reading, glossary) => {
  const db = await openFavWordsDatabase();

  saveToIndexedDB(db, 'favWords', {
    kanji,
    reading,
    glossary,
  });
};

export const getAllWordsByKey = async (key, val) => {
  const db = await openFavWordsDatabase();
  return getAllWithIndex({ db, storeName: 'favWords', index: key, val });
};

export const getAllWords = async (collection) => {
  const db = await openFavWordsDatabase();
  return getAllAsAnArray(db, collection);
};

export async function deleteRecord(word) {
  try {
    const db = await openFavWordsDatabase();

    const matchingWords = await getAllWordsByKey('kanji', word.kanji);

    if (!matchingWords || matchingWords.length === 0) {
      return null;
    }

    const wordToDelete = matchingWords.find(
      (w) => w.reading === word.reading && w.glossary === word.glossary
    );

    if (!wordToDelete) {
      console.log('No specific word match found');
      return null;
    }

    return deleteRecordDB(db, 'favWords', wordToDelete.id);
  } catch (error) {
    console.error('Error in deleteWord:', error);
    throw error;
  }
}

export async function compareThreeWords(
  kanjiValue,
  readingValue,
  glossaryValue
) {
  try {
    const [kanjiResults, readingResults, glossaryResults] = await Promise.all([
      getAllWordsByKey('kanji', kanjiValue),
      getAllWordsByKey('reading', readingValue),
      getAllWordsByKey('glossary', glossaryValue),
    ]);

    if (!kanjiResults || kanjiResults.length === 0) {
      return false;
    }

    // Find a word that matches all three criteria
    const matchingWord = kanjiResults.find(
      (word) =>
        // Check if there's any word in readingResults with the same id
        readingResults.some((r) => r.id === word.id) &&
        // AND check if there's any word in glossaryResults with the same id
        glossaryResults.some((g) => g.id === word.id)
    );
    // find() returns the first word that satisfies both conditions,
    // or undefined if no such word is found

    if (matchingWord) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error('Error comparing words:', error);
    return false;
  }
}

const showLikedWordsList = async (collection) => {
  const favWordList = getElement('#favWordsList');
  // Safety net for not throwing errors when not on addFavorites.html
  if (!favWordList) {
    return;
  }

  try {
    const likedWords = await getAllWords(collection);

    // Clear the list before adding new items
    favWordList.innerHTML = '';

    likedWords.forEach((word) => {
      const wordItem = document.createElement('div');
      wordItem.className = 'word-item';

      const kanjiSpan = document.createElement('span');
      const readingSpan = document.createElement('span');
      const removeWordButton = document.createElement('button');
      const glossaryDiv = document.createElement('div');
      const glossarySpan = document.createElement('span');

      kanjiSpan.textContent = word.kanji;
      kanjiSpan.className = 'kanji';

      readingSpan.textContent = word.reading;
      readingSpan.className = 'reading';

      removeWordButton.textContent = 'X';
      removeWordButton.className = 'removeWordButton';
      removeWordButton.onclick = async function (e) {
        // Prevent triggering wordItem click event
        e.stopPropagation();
        await deleteRecord(word);
        showLikedWordsList(collection);
      };

      glossarySpan.textContent = word.glossary || 'No glossary available';
      glossaryDiv.className = 'glossary';
      glossaryDiv.appendChild(glossarySpan);

      wordItem.appendChild(kanjiSpan);
      wordItem.appendChild(readingSpan);
      wordItem.appendChild(removeWordButton);
      wordItem.appendChild(glossaryDiv);
      favWordList.appendChild(wordItem);

      wordItem.addEventListener('click', () => {
        wordItem.classList.toggle('expanded');
        if (wordItem.classList.contains('expanded')) {
          fitTextToContainer(glossarySpan);
        }
      });
    });
  } catch (error) {
    console.error('Error retrieving liked words:', error);
  }
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
    showLikedWordsList(getCollectionName());
    kanjiSelector.value = '';
    readingSelector.value = '';
    glossarySelector.value = '';
  });
};

function initializeFavoriteWords() {
  const kanjiSelector = getElement('#favKanji');
  const readingSelector = getElement('#favReading');
  const glossarySelector = getElement('#favGlossary');
  const collectionSelector = getElement('#collection');

  // Safety net for not throwing errors when not on addFavorites.html
  if (kanjiSelector && readingSelector && glossarySelector) {
    addClickListenerToLikeButton(
      kanjiSelector,
      readingSelector,
      glossarySelector
    );
  }

  collectionSelector.addEventListener('change', async () => {
    const collection = getCollectionName();
    await showLikedWordsList(collection);
  });
}

initializeFavoriteWords();

window.onload = async () => {
  await showLikedWordsList();
};
