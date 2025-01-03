import { getElement } from './wrappers.js';
import { fitTextToContainer } from './utils.js';
import { getFromIndexedDB, openDatabase } from './indexedDBHandler.js';

let db;

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
  db = database;
  return db;
};

export const addWord = (kanji, reading, glossary) => {
  const transaction = db.transaction(['favWords'], 'readwrite');
  const objectStore = transaction.objectStore('favWords');
  const request = objectStore.add({
    kanji,
    reading,
    glossary,
  });

  request.onerror = (event) => {
    console.error('Error adding item: ' + event.target.error);
  };
};

export const getAllWordsByKey = (key, val) => {
  return getFromIndexedDB(db, 'favWords', (objectStore) => {
    const index = objectStore.index(key);
    const request = index.getAll(val);
    return request;
  });
};

export const getWordByKey = (key, val) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['favWords'], 'readonly');
    const objectStore = transaction.objectStore('favWords');
    const index = objectStore.index(key);
    const request = index.get(val);

    request.onsuccess = (event) => {
      if (request.result) {
        resolve(request.result);
      } else {
        resolve(null);
      }
    };

    request.onerror = (event) => {
      console.error('Error getting item: ' + event.target.error);
      reject(event.target.error);
    };
  });
};

export const getAllWords = async () => {
  try {
    const db = await openFavWordsDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['favWords'], 'readonly');
      const objectStore = transaction.objectStore('favWords');
      const request = objectStore.getAll();

      request.onsuccess = () => {
        if (request.result) {
          // Ensure we're always returning an array
          const resultArray = Array.isArray(request.result)
            ? request.result
            : [request.result];
          resolve(resultArray);
        } else {
          resolve([]); // Return an empty array if no items found
        }
      };

      request.onerror = (event) => {
        console.error('Error getting items: ' + event.target.error);
        reject(event.target.error);
      };
    });
  } catch (error) {
    console.error('Error in getAllWords:', error);
    throw error;
  }
};

export async function deleteRecord(state) {
  try {
    // Get all words with the matching kanji
    const words = await getAllWordsByKey(
      'kanji',
      state.currentCorrectWord.kanji
    );

    if (!words || words.length === 0) {
      return;
    }

    // Find the specific word that matches all criteria
    const wordToDelete = words.find(
      (word) =>
        word.reading === state.currentCorrectWord.reading &&
        word.glossary === state.currentCorrectWord.glossary
    );

    if (!wordToDelete) {
      return;
    }

    // Delete the matching word
    const db = await openFavWordsDatabase();
    const transaction = db.transaction(['favWords'], 'readwrite');
    const objectStore = transaction.objectStore('favWords');
    const deleteRequest = objectStore.delete(wordToDelete.id);

    return new Promise((resolve, reject) => {
      deleteRequest.onsuccess = () => {
        resolve('Word deleted successfully');
      };

      deleteRequest.onerror = (event) => {
        console.error('Error deleting word:', event.target.error);
        reject(event.target.error);
      };
    });
  } catch (error) {
    console.error('Error in deleteRecord:', error);
    throw error;
  }
}

export async function compareThreeWords(
  kanjiValue,
  readingValue,
  glossaryValue
) {
  try {
    const db = await openFavWordsDatabase();
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

const removeWord = async (word) => {
  try {
    const db = await openFavWordsDatabase();
    const transaction = db.transaction(['favWords'], 'readwrite');
    const objectStore = transaction.objectStore('favWords');
    const index = objectStore.index('kanji');

    // Get all words with the matching kanji
    const request = index.getAll(word.kanji);

    request.onsuccess = (event) => {
      const matchingWords = event.target.result;

      if (matchingWords.length === 0) {
        return;
      }

      // Find the specific word that matches all criteria
      const wordToDelete = matchingWords.find(
        (w) => w.reading === word.reading && w.glossary === word.glossary
      );

      if (!wordToDelete) {
        return;
      }

      // Delete the matching word
      const deleteRequest = objectStore.delete(wordToDelete.id);

      deleteRequest.onerror = (event) => {
        console.error('Error deleting word:', event.target.error);
      };
    };

    request.onerror = (event) => {
      console.error('Error finding words:', event.target.error);
    };
  } catch (error) {
    console.error('Error in removeWord:', error);
  }
};

const showLikedWordsList = async () => {
  const favWordList = getElement('#favWordsList');
  // Safety net for not throwing errors when not on addFavorites.html
  if (!favWordList) {
    return;
  }

  try {
    const likedWords = await getAllWords();

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
      removeWordButton.onclick = (e) => {
        // Prevent triggering wordItem click event
        e.stopPropagation();
        removeWord(word);
        showLikedWordsList();
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
    showLikedWordsList();
    kanjiSelector.value = '';
    readingSelector.value = '';
    glossarySelector.value = '';
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

window.onload = async () => {
  await showLikedWordsList();
};
