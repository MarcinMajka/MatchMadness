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
    const allFavWordsObjectsInArray = [...allFavWords];
    console.log(allFavWordsObjectsInArray);
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
      console.log(currentSetNumber);
      initializeSet(currentSetNumber);
    }
  } catch (error) {
    console.log(error);
  }
};
