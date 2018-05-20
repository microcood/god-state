import React from 'react';
import {each, cloneDeep, functions, omit} from 'lodash';
import {createContext} from './contexts';

const createStoreProvider = function (store, ProviderElement) {
  return class StoreProvider extends React.Component {
    constructor (props) {
      super(props);
      this.state = store;
      this.stateClone = cloneDeep(store);
      const methods = functions(this.state);

      each(methods, (method) => {
        this.state[method] = (...args) => {
          this.stateClone[method](...args);
          this.setState(omit(this._stateClone, methods));
        };
      });
    }

    render () {
      return React.createElement(ProviderElement, {value: this.state}, this.props.children);
    }
  };
};

export default class Provider extends React.Component {
  constructor (props) {
    super(props);
    each(this.props.stores, (store, name) => {
      const {ProviderElement} = createContext(name, store);

      this.providerTree = React.createElement(
        createStoreProvider(store, ProviderElement),
        {key: `${name}Provider`},
        this.providerTree ? [this.providerTree] : [this.props.children],
      );
    });
  }

  render () {
    return this.providerTree;
  }
}
