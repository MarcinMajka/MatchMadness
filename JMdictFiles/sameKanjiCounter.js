const { JM } = require('./dic');

const createKanjiToCountObject = (dict) => {
    const kanjiToCount = {};
    for (let i = 0; i < dict.length; i++) {
        kanjiToCount[dict[i].kanji] = (kanjiToCount[dict[i].kanji] || 0) + 1;
    }
    return kanjiToCount;
};

const kanjiToCountWithAllKanjis = createKanjiToCountObject(JM);

const createNonDistinctKanjiToCountObject = () => {
    const nonUniqueKanjiToCount = {};
    for (const kanji in kanjiToCountWithAllKanjis) {
        const currentKanjiCount = kanjiToCountWithAllKanjis[kanji];
        if (currentKanjiCount > 1) {
            nonUniqueKanjiToCount[kanji] = currentKanjiCount;
        }
    }
    return nonUniqueKanjiToCount;
};

const createNonUniqueKanjisArray = () => {
    const nonUniqueKanjis = [];
    for (const kanji in kanjiToCountWithAllKanjis) {
        const currentKanjiCount = kanjiToCountWithAllKanjis[kanji];
        if (currentKanjiCount > 1) {
            nonUniqueKanjis.push(kanji);
        }
    }
    return nonUniqueKanjis;
}

const createHiraganaToCountObject = (dict) => {
    const hiragana = {};
    const multiple = [];
    for (let i = 0; i < dict.length; i++) {
        hiragana[dict[i]['hiragana/katakana']] = (hiragana[dict[i]['hiragana/katakana']] || 0) + 1;
    }
    console.log("dict.length: ", dict.length)
    console.log("Object.keys(hiragana).length", Object.keys(hiragana).length)
    for (const hiraganaEntry in hiragana) {
        if (hiragana[hiraganaEntry] > 1) {
            multiple.push([hiragana, hiraganaEntry])
        }
    } 
    return multiple;
}

createHiraganaToCountObject(JM)