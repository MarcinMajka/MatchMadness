/**
 * @jest-environment jsdom
 */

const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const jsdom = require('jsdom');
const DEFAULT_HTML = `<html><body><div id="timer">00:00</div>
    <div class="container">
      <div class="leftColumn"></div>
      <div class="rightColumn"></div>
    </div>
    <div class="container">
      <div id="glossaryContainer">
        <p id="leftValueRightValue"></p>
        <p id="glossary"></p>
      </div>
    </div>
    <div class="buttonAndLicenseContainer">
      <div class="buttonContainer">
        <a href="matchMadness.html" class="button restartGame">RESTART</a>
        <a href="index.html" class="button menu">MENU</a>
      </div>
      <div class="container license">
        <a href="https://www.edrdg.org/wiki/index.php/JMdict-EDICT_Dictionary_Project" target="_blank" class="license">This
          app uses JMdict</a>
      </div></body></html>`;
global.document = new jsdom.JSDOM(DEFAULT_HTML);
global.window = document.defaultView;
global.navigator = window.navigator;
global.localStorage = window.localStorage;

const {
  shuffleArray,
  createLeftColValRightColValGlossaryTriplets,
  formatTime,
  checkIfWon,
} = require('./script');
// const JM = require('./dic');

describe('Test shuffleArray', () => {
  const elementsToOccurrences = (arr) => {
    arr.reduce((obj, item) => {
      obj[item] = (obj[item] || 0) + 1;
      return obj;
    }, {});
  };
  test('["A", "A", "A", "B", "B", "B"]', () => {
    const input = ['A', 'A', 'A', 'B', 'B', 'B'];
    const shuffledArray = shuffleArray([...input]);
    // Expect shuffled array to not have the same order of elements
    expect(shuffledArray).not.toEqual(input);
    // Expect the count of each element be the same in both input and shuffledArray
    expect(elementsToOccurrences(shuffledArray)).toEqual(
      elementsToOccurrences(input)
    );
  });
  test('["A"]', () => {
    const input = ['A'];
    const shuffledArray = shuffleArray([...input]);
    // Expect shuffled array to have the same order of elements (1 element)
    expect(shuffledArray).toEqual(input);
  });
  test('[]', () => {
    const input = [];
    const shuffledArray = shuffleArray([...input]);
    // Expect shuffled array to have the same order of elements (0 elements)
    expect(shuffledArray).toEqual(input);
  });
});

describe('Test createLeftColValRightColValGlossaryTriplets', () => {
  const arrayFromJSON = [
    { kanji: '火', 'hiragana/katakana': 'ひ', glossary: 'fire' },
    { kanji: '水', 'hiragana/katakana': 'みず', glossary: 'water' },
    { kanji: '木', 'hiragana/katakana': 'き', glossary: 'wood' },
    { kanji: '土', 'hiragana/katakana': 'ど', glossary: 'earth' },
    { kanji: '心臓', 'hiragana/katakana': 'しんぞう', glossary: 'heart' },
    { kanji: '空', 'hiragana/katakana': 'そら', glossary: 'sky' },
  ];
  test('3 expected entries', () => {
    expect(
      createLeftColValRightColValGlossaryTriplets(3, arrayFromJSON)
    ).toEqual([
      ['火', 'ひ', 'fire'],
      ['水', 'みず', 'water'],
      ['木', 'き', 'wood'],
    ]);
  });
  test('4 expected entries', () => {
    expect(
      createLeftColValRightColValGlossaryTriplets(4, arrayFromJSON)
    ).toEqual([
      ['火', 'ひ', 'fire'],
      ['水', 'みず', 'water'],
      ['木', 'き', 'wood'],
      ['土', 'ど', 'earth'],
    ]);
  });
  test('5 expected entries', () => {
    expect(
      createLeftColValRightColValGlossaryTriplets(5, arrayFromJSON)
    ).toEqual([
      ['火', 'ひ', 'fire'],
      ['水', 'みず', 'water'],
      ['木', 'き', 'wood'],
      ['土', 'ど', 'earth'],
      ['心臓', 'しんぞう', 'heart'],
    ]);
  });
  test('6 expected entries', () => {
    expect(
      createLeftColValRightColValGlossaryTriplets(6, arrayFromJSON)
    ).toEqual([
      ['火', 'ひ', 'fire'],
      ['水', 'みず', 'water'],
      ['木', 'き', 'wood'],
      ['土', 'ど', 'earth'],
      ['心臓', 'しんぞう', 'heart'],
      ['空', 'そら', 'sky'],
    ]);
  });
  test('More expected entries than the length of arrayJSON', () => {
    expect(
      createLeftColValRightColValGlossaryTriplets(7, arrayFromJSON)
    ).toEqual([
      ['火', 'ひ', 'fire'],
      ['水', 'みず', 'water'],
      ['木', 'き', 'wood'],
      ['土', 'ど', 'earth'],
      ['心臓', 'しんぞう', 'heart'],
      ['空', 'そら', 'sky'],
    ]);
  });
});

describe('Test formatTime', () => {
  test.each([10, 31, 54])('More than 9: %i', (value) => {
    expect(formatTime(value)).toBe(value);
  });
  test.each([9, 7, 3, 0])('Less than 10: %i', (value) => {
    expect(formatTime(value)).toBe('0' + value);
  });
});

describe('JSdom test', () => {
  test('first test', () => {
    const dom = new jsdom.JSDOM(
      `<!DOCTYPE html><body><p id="main">My First JSDOM!</p></body>`
    );
    // This prints "My First JSDOM!"
    expect(dom.window.document.getElementById('main').textContent).toBe(
      'My First JSDOM!'
    );
  });
});

describe('Test checkIfWon', () => {
  test('foundPairs == totalWordCount', () => {
    const gameWon = {
      state: {
        foundPairs: 7,
      },
      wordCount: 7,
    };
    expect(checkIfWon(gameWon.state, gameWon.wordCount)).toBe(true);
  });

  test('foundPairs < totalWordCount', () => {
    const gameNotWon = {
      state: {
        foundPairs: 9,
      },
      wordCount: 10,
    };

    expect(checkIfWon(gameNotWon.state, gameNotWon.wordCount)).toBe(false);
  });

  // TODO: throw an exception instead of returning false, since it's an impossible case
  test('foundPairs > totalWordCount', () => {
    const edgeCase_notAchievableForUser = {
      state: {
        foundPairs: 10,
      },
      wordCount: 7,
    };

    expect(
      checkIfWon(
        edgeCase_notAchievableForUser.state,
        edgeCase_notAchievableForUser.wordCount
      )
    ).toBe(false);
  });
});
