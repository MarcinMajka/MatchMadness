const {
  shuffleArray,
  createWordReadingGlossaryTriplets,
  formatTime,
} = require("./script");
// const JM = require('./dic');

describe("Test shuffleArray", () => {
  const elementsToOccurrences = (arr) => {
    arr.reduce((obj, item) => {
      obj[item] = (obj[item] || 0) + 1;
      return obj;
    }, {});
  };
  test('["A", "A", "A", "B", "B", "B"]', () => {
    const input = ["A", "A", "A", "B", "B", "B"];
    const shuffledArray = shuffleArray([...input]);
    // Expect shuffled array to not have the same order of elements
    expect(shuffledArray).not.toEqual(input);
    // Expect the count of each element be the same in both input and shuffledArray
    expect(elementsToOccurrences(shuffledArray)).toEqual(
      elementsToOccurrences(input)
    );
  });
  test('["A"]', () => {
    const input = ["A"];
    const shuffledArray = shuffleArray([...input]);
    // Expect shuffled array to have the same order of elements (1 element)
    expect(shuffledArray).toEqual(input);
    // Expect the count of each element be the same in both input and shuffledArray
    expect(elementsToOccurrences(shuffledArray)).toEqual(
      elementsToOccurrences(input)
    );
  });
  test("[]", () => {
    const input = [];
    const shuffledArray = shuffleArray([...input]);
    // Expect shuffled array to have the same order of elements (1 element)
    expect(shuffledArray).toEqual(input);
    // Expect the count of each element be the same in both input and shuffledArray
    expect(elementsToOccurrences(shuffledArray)).toEqual(
      elementsToOccurrences(input)
    );
  });
});

describe("Test createWordReadingGlossaryTriplets", () => {
  const arrayFromJSON = [
    { kanji: "火", "hiragana/katakana": "ひ", glossary: "fire" },
    { kanji: "水", "hiragana/katakana": "みず", glossary: "water" },
    { kanji: "木", "hiragana/katakana": "き", glossary: "wood" },
    { kanji: "土", "hiragana/katakana": "ど", glossary: "earth" },
    { kanji: "心臓", "hiragana/katakana": "しんぞう", glossary: "heart" },
    { kanji: "空", "hiragana/katakana": "そら", glossary: "sky" },
  ];
  test("3 expected entries", () => {
    expect(createWordReadingGlossaryTriplets(3, arrayFromJSON)).toEqual([
      ["火", "ひ", "fire"],
      ["水", "みず", "water"],
      ["木", "き", "wood"],
    ]);
  });
  test("4 expected entries", () => {
    expect(createWordReadingGlossaryTriplets(4, arrayFromJSON)).toEqual([
      ["火", "ひ", "fire"],
      ["水", "みず", "water"],
      ["木", "き", "wood"],
      ["土", "ど", "earth"],
    ]);
  });
  test("5 expected entries", () => {
    expect(createWordReadingGlossaryTriplets(5, arrayFromJSON)).toEqual([
      ["火", "ひ", "fire"],
      ["水", "みず", "water"],
      ["木", "き", "wood"],
      ["土", "ど", "earth"],
      ["心臓", "しんぞう", "heart"],
    ]);
  });
  test("6 expected entries", () => {
    expect(createWordReadingGlossaryTriplets(6, arrayFromJSON)).toEqual([
      ["火", "ひ", "fire"],
      ["水", "みず", "water"],
      ["木", "き", "wood"],
      ["土", "ど", "earth"],
      ["心臓", "しんぞう", "heart"],
      ["空", "そら", "sky"],
    ]);
  });
  test("More expected entries than the length of arrayJSON", () => {
    expect(createWordReadingGlossaryTriplets(7, arrayFromJSON)).toEqual([
      ["火", "ひ", "fire"],
      ["水", "みず", "water"],
      ["木", "き", "wood"],
      ["土", "ど", "earth"],
      ["心臓", "しんぞう", "heart"],
      ["空", "そら", "sky"],
    ]);
  });
});

describe("Test formatTime", () => {
  test("More than 9", () => {
    expect(formatTime(10)).toBe(10);
    expect(formatTime(31)).toBe(31);
    expect(formatTime(54)).toBe(54);
  });
  test("Less than 10", () => {
    expect(formatTime(9)).toBe("09");
    expect(formatTime(7)).toBe("07");
    expect(formatTime(3)).toBe("03");
    expect(formatTime(0)).toBe("00");
  });
});
