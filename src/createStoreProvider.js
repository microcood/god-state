import React from 'react';
import {cloneDeep, functions, forEach, omit} from 'lodash';

export default function (store, ProviderElement) {
  return class StoreProvider extends React.Component {
    constructor (props) {
      super(props);
      this.stateClone = cloneDeep(store);
      const methods = functions(this.stateClone);
      const wrappedMethods = {};

      forEach(methods, (method) => {
        wrappedMethods[method] = (...args) => {
          this.stateClone[method](...args);
          this.setState(omit(this.stateClone, methods));
        };
      });
      this.state = Object.assign(store, wrappedMethods);
    }

    render () {
      return React.createElement(
        ProviderElement, {value: this.state}, this.props.children);
    }
  };
}
