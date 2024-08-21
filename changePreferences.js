import { initializeSet } from './defaultPreferences.js';

const setIndexInput = document.getElementById('setIndexInput');
const setPairsToRenderInput = document.getElementById('setPairsToRenderInput');
setIndexInput.addEventListener('input', (event) => {
  const input = event.target.value;
  const index = input ? Number(input) - 1 : 0;
  initializeSet(index);
});
setPairsToRenderInput.addEventListener('input', (event) => {
  localStorage.setItem('pairsToRender', event.target.value);
});
