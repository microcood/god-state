import React from 'react';
import {each} from 'lodash';
import {getContext} from './contexts';

const wrapWithConsumer = function (name, Component) {
  return class ConsumerWrapper extends React.Component {
    render () {
      const passProps = this.props;

      return React.createElement(
        getContext(name).Consumer,
        {},
        (state) => {
          return React.cloneElement(Component, Object.assign({}, passProps, {[name]: state}));
        },
      );
    }
  };
};

export default function injectStore (...storeNames) {
  return function (Component) {
    return class InjectedComponent extends React.Component {
      constructor (props) {
        super(props);
        each(storeNames, (name) => {
          this.consumerTree = React.createElement(wrapWithConsumer(name, this.consumerTree ? this.consumerTree : React.createElement(Component)));
        });
      }
      render () {
        return this.consumerTree;
      }
    };
  };
}
