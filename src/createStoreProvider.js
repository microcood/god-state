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
        wrappedMethods[method] = async (...args) => {
          let result = this.stateClone[method](...args);

          if (result && result.constructor === Promise) {
            result = await result;
          }
          this.setState(omit(this.stateClone, this.methodNames));

          return result;
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
