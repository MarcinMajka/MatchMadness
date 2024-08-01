import { getElement } from './script.js';

export const startTimer = (state) => {
  state.gameStartTime = Date.now();
  // Update timer every second
  state.timerInterval = setInterval(() => updateTimer(state), 1000);
};

export const stopTimer = (state) => {
  // Stop the timer
  clearInterval(state.timerInterval);
  const gameEnd = Date.now();
  // Convert to seconds
  const gameDuration = (gameEnd - state.gameStartTime) / 1000;
  getElement('#timer').innerText = `Game duration: ${Math.floor(
    gameDuration
  )} seconds`;
};

const updateTimer = (state) => {
  const currentTime = Date.now();
  const elapsedTime = currentTime - state.gameStartTime;
  const minutes = Math.floor(elapsedTime / 60000);
  const seconds = Math.floor((elapsedTime % 60000) / 1000);
  getElement('#timer').innerText = `${formatTime(minutes)}:${formatTime(
    seconds
  )}`;
};

/**
 *
 * @param time - minutes or seconds as ints.
 * @returns string formatted in mm:ss format.
 */
const formatTime = (time) => {
  // If time is smaller than 10, add 0 in front, eg. 00:03, instead of 0:3.
  return time < 10 ? `0${time}` : time;
};
