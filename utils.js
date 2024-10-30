/**
 * Shuffle (randomize the order of) an array of leftColumnValues.
 * NOTE: there is no reason for this function to accept a dictionary as an argument, let's keep it simple.
 * @param array - an array of strings
 * @returns  a new array with the same strings, but in a random order
 */
export const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export const fitTextToContainer = (element) => {
  let fontSize = 30;
  element.style.fontSize = fontSize + 'px';

  while (element.scrollHeight > element.offsetHeight && fontSize > 10) {
    fontSize--;
    element.style.fontSize = fontSize + 'px';
  }
};

// module.exports = {
//   shuffleArray,
// };
