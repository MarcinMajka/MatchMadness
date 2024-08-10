export const getElement = (selector) => {
  return document.querySelector(selector);
};

export const addElement = (elementType) => {
  const element = document.createElement(elementType);
  return element;
};

export const setIntervalWrapper = (cb, timeIncrement) => {
  return setInterval(cb, timeIncrement);
};

export const clearIntervalWrapper = (timerInterval) => {
  clearInterval(timerInterval);
};

export const setTimeoutWrapper = (cb, timeoutDuration) => {
  setTimeout(cb, timeoutDuration);
};
