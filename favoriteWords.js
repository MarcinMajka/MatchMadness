import { getElement } from './wrappers.js';

let db;

const openDatabase = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('FavoriteWords', 1);

    request.onerror = (event) => {
      console.error('Database error: ' + event.target.error);
      reject(event.target.error);
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      console.log('Database opened successfully');
      resolve(db);
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
  });
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

const getAllWordsByKey = (key, val) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['favWords'], 'readonly');
    const objectStore = transaction.objectStore('favWords');
    const index = objectStore.index(key);
    const request = index.getAll(val);

    request.onsuccess = () => {
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

window.getAllWordsByKey = function (key, val) {
  getAllWordsByKey(key, val);
};

export const getAllWords = async () => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['favWords'], 'readonly');
      const objectStore = transaction.objectStore('favWords');
      const request = objectStore.getAll();

      request.onsuccess = () => {
        if (request.result) {
          console.log(`All items:`, request.result);
          console.log(`Type of result:`, typeof request.result);
          console.log(`Is array:`, Array.isArray(request.result));

          // Ensure we're always returning an array
          const resultArray = Array.isArray(request.result)
            ? request.result
            : [request.result];
          resolve(resultArray);
        } else {
          console.log('No items found');
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

window.getAllWords = getAllWords;

export async function deleteRecord(state) {
  try {
    // Get all words with the matching kanji
    const words = await getAllWordsByKey(
      'kanji',
      state.currentCorrectWord.kanji
    );

    if (!words || words.length === 0) {
      console.log('No words found with the given kanji');
      return;
    }

    // Find the specific word that matches all criteria
    const wordToDelete = words.find(
      (word) =>
        word.reading === state.currentCorrectWord.reading &&
        word.glossary === state.currentCorrectWord.glossary
    );

    if (!wordToDelete) {
      console.log('No exact match found');
      return;
    }

    // Delete the matching word
    const db = await openDatabase();
    const transaction = db.transaction(['favWords'], 'readwrite');
    const objectStore = transaction.objectStore('favWords');
    const deleteRequest = objectStore.delete(wordToDelete.id);

    return new Promise((resolve, reject) => {
      deleteRequest.onsuccess = () => {
        console.log('Word deleted successfully');
        resolve('Word deleted successfully');
      };

      deleteRequest.onerror = (event) => {
        console.error('Error deleting word:', event.target.error);
        reject(event.target.error);
      };

      transaction.oncomplete = () => {
        console.log('Transaction completed');
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
    console.log('Running compareThreeWords()');
    const db = await openDatabase();
    const [kanjiResults, readingResults, glossaryResults] = await Promise.all([
      getAllWordsByKey('kanji', kanjiValue),
      getAllWordsByKey('reading', readingValue),
      getAllWordsByKey('glossary', glossaryValue),
    ]);

    if (!kanjiResults || kanjiResults.length === 0) {
      console.log('Not in the database');
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

const removeWord = async (word) => {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(['favWords'], 'readwrite');
    const objectStore = transaction.objectStore('favWords');
    const index = objectStore.index('kanji');

    // Get all words with the matching kanji
    const request = index.getAll(word.kanji);

    request.onsuccess = (event) => {
      const matchingWords = event.target.result;

      if (matchingWords.length === 0) {
        console.log('No words found with the given kanji');
        return;
      }

      // Find the specific word that matches all criteria
      const wordToDelete = matchingWords.find(
        (w) => w.reading === word.reading && w.glossary === word.glossary
      );

      if (!wordToDelete) {
        console.log('No exact match found');
        return;
      }

      // Delete the matching word
      const deleteRequest = objectStore.delete(wordToDelete.id);

      deleteRequest.onsuccess = () => {
        console.log('Word deleted successfully');
        // Refresh the word list after successful deletion
        showLikedWordsList();
      };

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
    console.log('Liked words:', likedWords);

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

function fitTextToContainer(element) {
  let fontSize = 30;
  element.style.fontSize = fontSize + 'px';

  while (element.scrollHeight > element.offsetHeight && fontSize > 10) {
    fontSize--;
    element.style.fontSize = fontSize + 'px';
  }
}

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
