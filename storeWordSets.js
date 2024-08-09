import { loadDicIn50WordSets } from './indexedDBHandler.js';

const DB_NAME = 'AllWordSets';
const STORE_NAME = 'WordSets';
const FILE_URL = './dicIn50WordSets.json';

const parseAsTriplets = (listOfTripletsData) => {
  return listOfTripletsData.map((tripletData) => ({
    kanji: tripletData[0],
    reading: tripletData[1],
    glossary: tripletData[2],
  }));
};

export async function initializeSet(setIndex) {
  try {
    const wordSets = await loadDicIn50WordSets(DB_NAME, STORE_NAME, FILE_URL);
    const currentSet = parseAsTriplets(wordSets[setIndex]);

    localStorage.setItem('currentSet', JSON.stringify(currentSet));
  } catch (error) {
    console.error('Failed to initialize data:', error);
  }
}
