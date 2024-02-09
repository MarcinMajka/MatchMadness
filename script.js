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

    firstElement.addEventListener('click', (event) => {
        const element = event.target;
        const elementText = element.innerHTML;
        first = elementText;
        checkIfMatch();
    });
    
    secondElement.addEventListener('click', (event) => {
        const element = event.target;
        const elementText = element.innerHTML;
        second = elementText;
        checkIfMatch();
    });
})


const checkIfMatch = () => {
    console.log(first, second)
    if (first !== null && second !== null) {
        if (first === second) {
            console.log("match");
            firstElement.innerHTML = null;
            secondElement.innerHTML = null;
        } else {
            console.log("not a match");
        }
    }
};