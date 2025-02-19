import { loadDataWithFallback } from './indexedDBHandler.js';
import { countKanjiOccurrences, getNonUniqueKanji } from './utils.js';

const parseAsTriplets = (listOfTripletsData) => {
  return listOfTripletsData.map((tripletData) => ({
    kanji: tripletData[0],
    reading: tripletData[1],
    glossary: tripletData[2],
  }));
};

async function getAllWordsAsObject() {
  try {
    const wordSets = await loadDataWithFallback({
      DB_NAME: 'AllWordSets',
      STORE_NAME: 'WordSets',
      FILE_URL: './dicIn50WordSets.json',
      key: 'dicIn50WordSets.json',
      data: 'AllWordSetsBlob',
    });

    const accumulatedKanjiCounter = {};
    const accumulatedKanjiReadings = {};

    for (const set of wordSets) {
      const parsedSet = parseAsTriplets(set);
      const { sameKanjiObjectCounter, sameKanjiObject } =
        countKanjiOccurrences(parsedSet);

      // Merge the counters
      for (const kanji in sameKanjiObjectCounter) {
        accumulatedKanjiCounter[kanji] =
          (accumulatedKanjiCounter[kanji] || 0) + sameKanjiObjectCounter[kanji];
      }

      // Merge the readings
      for (const kanji in sameKanjiObject) {
        if (!accumulatedKanjiReadings[kanji]) {
          accumulatedKanjiReadings[kanji] = [];
        }
        accumulatedKanjiReadings[kanji].push(...sameKanjiObject[kanji]);
      }
    }
    return { accumulatedKanjiCounter, accumulatedKanjiReadings };
  } catch (error) {
    console.log(error);
  }
}

const { accumulatedKanjiCounter, accumulatedKanjiReadings } =
  await getAllWordsAsObject();

// polyphonic - having multiple sounds (redings in this case)
const polyphonicKanjis = getNonUniqueKanji(
  accumulatedKanjiCounter,
  accumulatedKanjiReadings
);

function saveToFile(filename, content) {
  const blob = new Blob([content], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Save the data in the browser
// saveToFile('polyphonicKanjis.json', JSON.stringify(polyphonicKanjis, null, 2));
