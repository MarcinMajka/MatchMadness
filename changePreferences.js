import { initializeSet } from './defaultPreferences.js';
import { getAllWords } from './favoriteWords.js';

const setIndexInput = document.getElementById('setIndexInput');
const setPairsToRenderInput = document.getElementById('setPairsToRenderInput');
const favWordsButton = document.getElementById('favWordsButton');
setIndexInput.addEventListener('input', (event) => {
  const input = event.target.value;
  const index = input ? Number(input) - 1 : 0;
  initializeSet(index);
});
setPairsToRenderInput.addEventListener('input', (event) => {
  localStorage.setItem('pairsToRender', event.target.value);
});
favWordsButton.onclick = async function () {
  try {
    const allFavWords = await getAllWords();
    console.log(allFavWords);
  } catch (error) {
    console.log(error);
  }
};
