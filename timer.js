import {
  clearIntervalWrapper,
  getElement,
  setIntervalWrapper,
} from './wrappers.js';

export const startTimer = (state) => {
  state.gameStartTime = Date.now();
  // Update timer every second
  state.timerInterval = setIntervalWrapper(() => updateTimer(state), 1000);
};

const getGameDuration = (state) => {
  // Stop the timer
  clearIntervalWrapper(state.timerInterval);

  const gameEnd = Date.now();
  const gameDuration = (gameEnd - state.gameStartTime) / 1000;

  // Convert to seconds
  return Math.floor(gameDuration);
};

const showGameDuration = (gameDuration) => {
  getElement('#timer').innerText = `Game duration: ${gameDuration} seconds`;
};

export const stopTimer = (state) => {
  const gameDuration = getGameDuration(state);
  showGameDuration(gameDuration);
};

const getElapsedTime = (state) => {
  const currentTime = Date.now();
  const elapsedTime = currentTime - state.gameStartTime;

  return {
    minutes: Math.floor(elapsedTime / 60000),
    seconds: Math.floor((elapsedTime % 60000) / 1000),
  };
};

const updateTimer = (state) => {
  const elapsedTime = getElapsedTime(state);

  // TODO: UI function
  getElement('#timer').innerText = `${formatTime(
    elapsedTime.minutes
  )}:${formatTime(elapsedTime.seconds)}`;
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
