const wordMadnessWord = document.getElementById('word')
const wordMadnessInput = document.getElementById('userInput')
const wordMadnessGlossary = document.getElementById('glossary')

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

function validateInput(e) {
  if (e.code === 'Space' || e.code === 'Enter') {
    if (wordMadnessInput.value.trim() === wordMadnessWord.innerText) {
      updateGlossary()
      updateWord()
    }
  }
}

function updateWord() {
  console.log(currentSetIndex)
  if (wordIndex < data[currentSetIndex].length) {
    wordMadnessWord.innerText = data[currentSetIndex][wordIndex][0]
    wordMadnessInput.value = ''
    wordIndex++
  } else {
    currentSetIndex++
    wordIndex = 0
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

wordMadnessInput.addEventListener('keyup', validateInput)
wordMadnessInput.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault()
  }
})

window.addEventListener('load', () => {
  updateWord()
  wordMadnessInput.focus()
})
