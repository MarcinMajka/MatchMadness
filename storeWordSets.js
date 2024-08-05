import { loadDicIn50WordSets } from './indexedDBHandler.js';

const DB_NAME = 'MyDatabase';
const STORE_NAME = 'Files';
const FILE_URL = './dicIn50WordSets.json';

async function initializeData() {
  try {
    const wordSets = await loadDicIn50WordSets(DB_NAME, STORE_NAME, FILE_URL);
    console.log('Loaded word sets:', wordSets);
    useFileData(wordSets);
  } catch (error) {
    console.error('Failed to initialize data:', error);
  }
}

function useFileData(data) {
  console.log('Using file data:', data);
  if (Array.isArray(data) && data.length > 0) {
    const specificArray = data[0];
    console.log('Specific array:', specificArray);
  } else {
    console.error(
      'Data is not in the expected format. Check the JSON structure.'
    );
  }
}

initializeData();
