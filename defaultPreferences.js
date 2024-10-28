import { getElement } from './wrappers.js';
import { loadDataWithFallback } from './indexedDBHandler.js';
import { getAllWords } from './favoriteWords.js';

const parseAsTriplets = (listOfTripletsData) => {
  return listOfTripletsData.map((tripletData) => ({
    kanji: tripletData[0],
    reading: tripletData[1],
    glossary: tripletData[2],
  }));
};

async function initializeSet(setIndex) {
  try {
    const wordSets = await loadDataWithFallback({
      DB_NAME: 'AllWordSets',
      STORE_NAME: 'WordSets',
      FILE_URL: './dicIn50WordSets.json',
      key: 'dicIn50WordSets.json',
      data: 'AllWordSetsBlob',
    });
    const currentSet = parseAsTriplets(wordSets[setIndex]);

    localStorage.setItem('currentSet', JSON.stringify(currentSet));
  } catch (error) {
    console.error('Failed to initialize data:', error);
  }
}

const setIndexInput = getElement('#setIndexInput');
const setPairsToRenderInput = getElement('#setPairsToRenderInput');
const favWordsButton = getElement('#favWordsButton');
setIndexInput.addEventListener('input', (event) => {
  const input = event.target.value;
  // Check if the input is there. If it is, make it an index, else just use 0
  let index = input ? input - 1 : 0;
  // Check if the index is out of bounds. If it is, use 0
  index = index < 0 || index > 2762 ? 0 : index;
  initializeSet(index);
});
setPairsToRenderInput.addEventListener('input', (event) => {
  localStorage.setItem('pairsToRender', event.target.value);
});
favWordsButton.onclick = async function () {
  try {
    const allFavWords = await getAllWords();

    if (allFavWords.length === 0) {
      alert("You don't have any favorite words yet. Like some words first!");
      return;
    }

    const allFavWordsObjectsInArray = [...allFavWords];
    localStorage.setItem(
      'currentSet',
      JSON.stringify(allFavWordsObjectsInArray)
    );
    favWordsButton.classList.toggle('favWordsAdded');
    if (favWordsButton.classList.contains('favWordsAdded')) {
      favWordsButton.innerText = 'Yay Favorite Words!';
    } else {
      favWordsButton.innerText = 'Use Favorite Words!';
      const currentSetNumber =
        setIndexInput.value == '' ? 0 : setIndexInput.value - 1;
      initializeSet(currentSetNumber);
    }
  } catch (error) {
    console.log(error);
  }
};

window.onload = () => {
  initializeSet(0);
};
