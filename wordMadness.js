const wordMadnessWord = document.getElementById('word')
const wordMadnessInput = document.getElementById('userInput')
const wordMadnessGlossary = document.getElementById('glossary')
const matchesInSetButton = document.getElementById('matches')
const wrongCountInSetButton = document.getElementById('wrong')

const data = [
  [
    ['A', 'A', 'A -> A: A'],
    ['B', 'B', 'B -> B: B'],
    ['C', 'C', 'C -> C: C'],
    ['D', 'D', 'D -> D: D'],
    ['E', 'E', 'E -> E: E'],
  ],
  [
    ['F', 'F', 'F -> F: F'],
    ['G', 'G', 'G -> G: G'],
    ['H', 'H', 'H -> H: H'],
    ['I', 'I', 'I -> I: I'],
    ['J', 'J', 'J -> J: J'],
  ],
  [
    ['K', 'K', 'K -> K: K'],
    ['L', 'L', 'L -> L: L'],
    ['M', 'M', 'M -> M: M'],
    ['N', 'N', 'N -> N: N'],
    ['O', 'O', 'O -> O: O'],
  ],
]

let currentSetIndex = 0
let wordIndex = 0
let currentSetMatchCount = 0
let wrongCountInSet = 0

function validateInput(e) {
  if (e.code === 'Space' || e.code === 'Enter') {
    if (wordMadnessInput.value.trim() === wordMadnessWord.innerText) {
      currentSetMatchCount++
      updateGlossary()
      updateWord()
    } else {
      //   If input is blank, let's not count it towards fails
      if (wordMadnessInput.value === '') return
      wrongCountInSet++
      displayFailedTries()
    }
  }
}

function updateWord() {
  console.log(currentSetIndex)
  displayMatches()
  if (wordIndex < data[currentSetIndex].length) {
    wordMadnessWord.innerText = data[currentSetIndex][wordIndex][0]
    wordMadnessInput.value = ''
    wordIndex++
  } else {
    currentSetIndex++
    wordIndex = 0
    currentSetMatchCount = 0
    if (currentSetIndex < data.length) {
      alert('New SET!')
      updateWord()
    } else {
      alert('Congrats!')
    }
  }
}

function updateGlossary() {
  wordMadnessGlossary.innerText = `${
    data[currentSetIndex][wordIndex - 1][0]
  } - ${data[currentSetIndex][wordIndex - 1][0]}\n ${
    data[currentSetIndex][wordIndex - 1][2]
  }\n ${data[currentSetIndex][wordIndex - 1][2]}`
}

function displayMatches() {
  const currentSetLenght = data[currentSetIndex].length
  matchesInSetButton.innerText = `${currentSetMatchCount}/${currentSetLenght}`
}

function displayFailedTries() {
  wrongCountInSetButton.innerText = `Fails: ${wrongCountInSet}`
}

wordMadnessInput.addEventListener('keyup', validateInput)
wordMadnessInput.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault()
  }
})

window.addEventListener('load', () => {
  updateWord()
  wordMadnessInput.focus()
  displayMatches()
  displayFailedTries()
})
