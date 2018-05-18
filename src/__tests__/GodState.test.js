import React from 'react'
import 'dom-testing-library/extend-expect'
import {render} from 'react-testing-library'
import Provider from '../Provider'
import injectStore from '../injectStore'

const r = React.createElement

let counter = { value: 0, increase: function () { this.value++ } }
let provider = props => r(Provider, {stores: {counter}}, props.children)
let displayValue = props => r('div', {}, [ `value: ${props.counter.value}` ])

test('simple render of the value', () => {
  const {getByText} = render(
    r(provider, {}, [
      r(injectStore('counter')(displayValue), {key: 234})
    ])
  )

  expect(getByText(/value:/)).toHaveTextContent('value: 0')
})
