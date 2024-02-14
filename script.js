// first and second -> [div.class, div.class.innerHTML]
let first = null;
let second = null;
let word1 = null;
let word2 = null;
let word3 = null;
let word4 = null;
let word5 = null;
let kanji1 = null;
let kanji2 = null;
let kanji3 = null;
let kanji4 = null;
let kanji5 = null;
const words = [word1, word2, word3, word4, word5];
const kanjis = [kanji1, kanji2, kanji3, kanji4, kanji5];
// creating a word: translation object
const dict = {};
for (let i = 1; i < 10; i++) {
    dict[`word${i}`] = `translation${i}`;
}
// creating an array of shuffled dict keys
const shuffleWords = (dict) => {
    const words = Object.keys(dict);
    for (let i = words.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [words[i], words[j]] = [words[j], words[i]];
    }
    return words;
};
const shuffledWords = shuffleWords(dict);

let i = 0;

window.addEventListener('load', () => {
    word1 = document.querySelector(".english1");
    word2 = document.querySelector(".english2");
    word3 = document.querySelector(".english3");
    word4 = document.querySelector(".english4");
    word5 = document.querySelector(".english5");

    kanji1 = document.querySelector(".kanji1");
    kanji2 = document.querySelector(".kanji2");
    kanji3 = document.querySelector(".kanji3");
    kanji4 = document.querySelector(".kanji4");
    kanji5 = document.querySelector(".kanji5");
    // assigning divs with their words and kanjis
    while (i < 5) {
        document.querySelector(`.english${i + 1}`).innerHTML = shuffledWords[i];
        document.querySelector(`.kanji${i + 1}`).innerHTML = dict[shuffledWords[i]];
        i++;
    }

    word1.addEventListener('click', (event) => {
        const element = event.target;
        const elementText = element.innerHTML;
        first = [word1, elementText];
        checkIfMatch();
    });

    word2.addEventListener('click', (event) => {
        const element = event.target;
        const elementText = element.innerHTML;
        first = [word2, elementText];
        checkIfMatch();
    });

    word3.addEventListener('click', (event) => {
        const element = event.target;
        const elementText = element.innerHTML;
        first = [word3, elementText];
        checkIfMatch();
    });

    word4.addEventListener('click', (event) => {
        const element = event.target;
        const elementText = element.innerHTML;
        first = [word4, elementText];
        checkIfMatch();
    });

    word5.addEventListener('click', (event) => {
        const element = event.target;
        const elementText = element.innerHTML;
        first = [word5, elementText];
        checkIfMatch();
    });
    
    kanji1.addEventListener('click', (event) => {
        const element = event.target;
        console.log(element)
        const elementText = element.innerHTML;
        second = [kanji1, elementText];
        checkIfMatch();
    });

    kanji2.addEventListener('click', (event) => {
        const element = event.target;
        const elementText = element.innerHTML;
        second = [kanji2, elementText];
        checkIfMatch();
    });

    kanji3.addEventListener('click', (event) => {
        const element = event.target;
        const elementText = element.innerHTML;
        second = [kanji3, elementText];
        checkIfMatch();
    });

    kanji4.addEventListener('click', (event) => {
        const element = event.target;
        const elementText = element.innerHTML;
        second = [kanji4, elementText];
        checkIfMatch();
    });

    kanji5.addEventListener('click', (event) => {
        const element = event.target;
        const elementText = element.innerHTML;
        second = [kanji5, elementText];
        checkIfMatch();
    });
})

const checkIfMatch = () => {
    console.log(first, second)
    if (first !== null && second !== null) {
        if (dict[first[1]] === second[1]) {
            console.log(first[1], second[1])
            console.log("match");
            // incrementing the shuffledWords pointer i
            i++;
            // reassigning the innerHTML of word1 and kanji1 to next in line from shuffledWords[i] and dict[shuffledWords[i]]
            if(shuffledWords[i]) {
                first[0].innerHTML = shuffledWords[i];
                second[0].innerHTML = dict[shuffledWords[i]];
            } else {
                first[0].innerHTML = null;
                second[0].innerHTML = null;
            }
        } else {
            console.log("not a match");
        }
        // cleaning up state variables
        first = null;
        second = null;
    }
};