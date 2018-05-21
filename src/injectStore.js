import React from 'react';
import {forEach} from 'lodash';
import {getContext} from './contexts';

const wrapWithConsumer = function (name, Component) {
  return (props) => {
    return React.createElement(getContext(name).Consumer, {}, (state) => {
      return React.cloneElement(
        Component, Object.assign({}, props, {[name]: state})
      );
    });
  };
};

export default function injectStore (...storeNames) {
  return function (Component) {
    return () => {
      let consumerTree;

      forEach(storeNames, (name) => {
        consumerTree = React.createElement(
          wrapWithConsumer(
            name, consumerTree ? consumerTree : React.createElement(Component)
          )
        );
      });

      return consumerTree;
    };
  };
}
