import { loadDicIn50WordSets } from './indexedDBHandler.js';

const DB_NAME = 'AllWordSets';
const STORE_NAME = 'WordSets';
const FILE_URL = './dicIn50WordSets.json';

export async function initializeSet(setIndex) {
  try {
    const wordSets = await loadDicIn50WordSets(DB_NAME, STORE_NAME, FILE_URL);
    console.log('Loaded word sets:', wordSets);
    localStorage.setItem('currentSet', JSON.stringify(wordSets[setIndex]));
  } catch (error) {
    console.error('Failed to initialize data:', error);
  }
}
