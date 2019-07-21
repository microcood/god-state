import React, {useState} from 'react';

const stores = {};

export const createStore = function (name, obj) {
  stores[name] = obj;
};

export const useStore = function (name) {
  const [, setState] = useState(0);

  return [stores[name], function (change) {
    stores[name] = Object.assign(stores[name], change);
    setState(prev => prev + 1);
  }];
};
