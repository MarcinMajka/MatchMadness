export const getElement = (selector) => {
  return document.querySelector(selector);
};

export const addElement = (elementType) => {
  const element = document.createElement(elementType);
  return element;
};
