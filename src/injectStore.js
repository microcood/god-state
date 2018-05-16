import React from 'react'
import {getContext} from './contexts'
import {each} from 'lodash'

function wrapWithConsumer (name, Component) {
  return class ConsumerWrapper extends React.Component {
    render () {
      console.log('name ', name)
      const passProps = this.props
      return React.createElement(
        getContext(name).Consumer,
        {},
        function (state) {
          return React.cloneElement(Component, Object.assign({}, passProps, {[name]: state}))
        })
    }
  }
}

export function injectStore (...storeNames) {
  return function (Component) {
    return class InjectedComponent extends React.Component {
      constructor (props) {
        super(props)
        each(storeNames, (name) => {
          this.consumerTree = React.createElement(
            wrapWithConsumer(name, this.consumerTree ? this.consumerTree : React.createElement(Component))
          )
        })
      }
      render () { return this.consumerTree }
    }
  }
}
