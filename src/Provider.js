import React from 'react'
import {createContext} from './contexts'
import {each, cloneDeep, functions, omit} from 'lodash'

function createStoreProvider (store, Provider) {
  return class StoreProvider extends React.Component {
    constructor (props) {
      super(props)
      this.state = store
      this._stateClone = cloneDeep(store)
      let methods = functions(this.state)
      each(methods, (method) => {
        this.state[method] = (...args) => {
          this._stateClone[method](...args)
          this.setState(omit(this._stateClone, methods))
        }
      })
    }
    render () {
      return React.createElement(Provider, {value: this.state}, this.props.children)
    }
  }
}

export default class Provider extends React.Component {
  constructor (props) {
    super(props)
    each(this.props.stores, (store, name) => {
      const {Provider} = createContext(name, store)
      this.providerTree = React.createElement(
        createStoreProvider(store, Provider),
        {key: `${name}Provider`},
        this.providerTree ? [this.providerTree] : [this.props.children]
      )
    })
  }
  render () { return this.providerTree }
}
