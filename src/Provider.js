import React from 'react';
import {forEach} from 'lodash';
import {createContext} from './contexts';
import createStoreProvider from './createStoreProvider';

export default class Provider extends React.Component {
  constructor (props) {
    super(props);
    forEach(this.props.stores, (store, name) => {
      const context = createContext(name, store);

      this.providerTree = React.createElement(
        createStoreProvider(store, context.Provider),
        {key: `${name}Provider`},
        this.providerTree ? [this.providerTree] : [this.props.children],
      );
    });
  }

  render () {
    return this.providerTree;
  }
}
