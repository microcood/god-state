import React from 'react';
import {cloneDeep, isFunction, functions, omit} from 'lodash';

export default function (store, ProviderElement) {
  return class StoreProvider extends React.Component {
    constructor (props) {
      super(props);

      if (store.constructor === Object) {
        this.stateClone = cloneDeep(store);
        this.methodNames = functions(store);
      } else {
        const storePrototype = Object.getPrototypeOf(store);

        this.stateClone = Object.assign(Object.create(storePrototype), store);
        this.methodNames = Object.getOwnPropertyNames(storePrototype)
          .filter((name) => {
            return isFunction(storePrototype[name]) && name !== 'constructor';
          });
      }

      const wrappedMethods = {};

      this.methodNames.forEach((method) => {
        wrappedMethods[method] = (...args) => {
          this.stateClone[method](...args);
          this.setState(omit(this.stateClone, this.methodNames));
        };
      });
      this.state = Object.assign({}, store, wrappedMethods);
    }

    render () {
      return React.createElement(
        ProviderElement, {value: this.state}, this.props.children);
    }
  };
}
