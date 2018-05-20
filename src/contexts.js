import React from 'react';

const contexts = {};

export const createContext = function (name, store) {
  contexts[name] = React.createContext(store);

  return contexts[name];
};

export const getContext = function (name) {
  return contexts[name];
};
