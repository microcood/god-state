/* eslint react/no-multi-comp: 0 */
import React from 'react'
import 'dom-testing-library/extend-expect'
import { render, Simulate } from 'react-testing-library'
import { Provider, useStore } from '../index'

test('simple render of the value', () => {
  const Counter = () => {
    const [counter] = useStore('counter')

    return <div>counter value: {counter.value}</div>
  }
  const { getByText } = render(
    <Provider stores={{ counter: { value: 0 } }}>
      <Counter />
    </Provider>
  )

  expect(getByText(/value:/)).toHaveTextContent('value: 0')
})

test('value changes after method call', () => {
  const Counter = () => {
    const [counter, changeCounter] = useStore('counter')
    const increase = function() {
      changeCounter({ value: counter.value + 1 })
    }

    return (
      <div>
        <div>value: {counter.value}</div>
        <button onClick={increase}>increase value</button>
      </div>
    )
  }
  const { getByText } = render(
    <Provider stores={{ counter: { value: 0 } }}>
      <Counter />
    </Provider>
  )

  expect(getByText(/value:/)).toHaveTextContent('value: 0')

  Simulate.click(getByText(/increase value/))
  expect(getByText(/value:/)).toHaveTextContent('value: 1')
})

test('intermediate components do not rerender', () => {
  const Counter = () => {
    const [counter, changeCounter] = useStore('counter')
    const increase = function() {
      changeCounter({ value: counter.value + 1 })
    }

    return (
      <div>
        <div>value: {counter.value}</div>
        <button onClick={increase}>increase value</button>
      </div>
    )
  }
  let renderCounts = 0

  class Intermediate extends React.Component {
    render() {
      renderCounts++

      return this.props.children
    }
  }

  const { getByText } = render(
    <Provider stores={{ counter: { value: 0 } }}>
      <Intermediate>
        <Counter />
      </Intermediate>
    </Provider>
  )

  Simulate.click(getByText(/increase value/))
  Simulate.click(getByText(/increase value/))
  expect(getByText(/value:/)).toHaveTextContent('value: 2')
  expect(renderCounts).toEqual(1)
})

test('components can be injected with multiple stores', () => {
  const Counter = () => {
    const [counter, changeCounter] = useStore('counter')
    const increase = function() {
      changeCounter({ value: counter.value + 1 })
    }

    const [doubleCounter, changeDoubleCounter] = useStore('doubleCounter')
    const doubleIncrease = function() {
      changeDoubleCounter({ value: doubleCounter.value + 2 })
    }

    const [tripleCounter, changeTripleCounter] = useStore('tripleCounter')
    const tripleIncrease = function() {
      changeTripleCounter({ value: tripleCounter.value + 3 })
    }

    return (
      <div>
        <div>
          values: {counter.value}:{doubleCounter.value}:{tripleCounter.value}
        </div>
        <button onClick={increase}>increase counter</button>
        <button onClick={doubleIncrease}>increase doubleCounter</button>
        <button onClick={tripleIncrease}>increase tripleCounter</button>
      </div>
    )
  }
  const { getByText } = render(
    <Provider
      stores={{
        counter: { value: 0 },
        doubleCounter: { value: 0 },
        tripleCounter: { value: 0 }
      }}
    >
      <Counter />
    </Provider>
  )

  Simulate.click(getByText(/increase counter/))
  expect(getByText(/values:/)).toHaveTextContent('1:0:0')

  Simulate.click(getByText(/increase doubleCounter/))
  expect(getByText(/values:/)).toHaveTextContent('1:2:0')

  Simulate.click(getByText(/increase tripleCounter/))
  expect(getByText(/values:/)).toHaveTextContent('1:2:3')
})

test('injected components rerender independently', () => {
  let renderedCounter = 0
  let renderedDoubleCounter = 0

  const Counter = () => {
    const [counter, changeCounter] = useStore('counter')
    const increase = function() {
      changeCounter({ value: counter.value + 1 })
    }

    renderedCounter++

    return (
      <div>
        <button onClick={increase}>increase counter</button>
      </div>
    )
  }
  const DoubleCounter = () => {
    const [doubleCounter, changeDoubleCounter] = useStore('doubleCounter')
    const doubleIncrease = function() {
      changeDoubleCounter({ value: doubleCounter.value + 2 })
    }

    renderedDoubleCounter++

    return (
      <div>
        <button onClick={doubleIncrease}>increase doubleCounter</button>
      </div>
    )
  }

  const { getByText } = render(
    <Provider
      stores={{
        counter: { value: 0 },
        doubleCounter: { value: 0 }
      }}
    >
      <Counter />
      <DoubleCounter />
    </Provider>
  )

  expect([renderedCounter, renderedDoubleCounter]).toEqual([1, 1])

  Simulate.click(getByText(/increase counter/))
  expect([renderedCounter, renderedDoubleCounter]).toEqual([2, 1])

  Simulate.click(getByText(/increase doubleCounter/))
  expect([renderedCounter, renderedDoubleCounter]).toEqual([2, 2])
})

test('custom hook support', () => {
  const useCounter = function() {
    const [counter, changeCounter] = useStore('counter')
    const increase = function() {
      changeCounter({ value: counter.value + 1 })
    }

    return {
      increase,
      ...counter
    }
  }
  const Counter = () => {
    const counter = useCounter()

    return (
      <div>
        <div>value: {counter.value}</div>
        <button onClick={counter.increase}>increase value</button>
      </div>
    )
  }
  const { getByText } = render(
    <Provider
      stores={{
        counter: { value: 0 }
      }}
    >
      <Counter />
    </Provider>
  )

  expect(getByText(/value:/)).toHaveTextContent('value: 0')

  Simulate.click(getByText(/increase value/))
  expect(getByText(/value:/)).toHaveTextContent('value: 1')
  Simulate.click(getByText(/increase value/))
  expect(getByText(/value:/)).toHaveTextContent('value: 2')
})

test('store updates multiple components', () => {
  const useCounter = function() {
    const [counter, changeCounter] = useStore('counter')

    const increase = function() {
      changeCounter({ value: counter.value + 1 })
    }

    return {
      increase,
      ...counter
    }
  }
  const Counter = () => {
    const counter = useCounter()
    return (
      <div>
        <div>value: {counter.value}</div>
        <button onClick={counter.increase}>increase value</button>
      </div>
    )
  }
  const Counter2 = () => {
    const counter = useCounter()
    return (
      <div>
        <div>value2: {counter.value}</div>
      </div>
    )
  }
  const { getByText } = render(
    <Provider
      stores={{
        counter: { value: 0 }
      }}
    >
      <Counter />
      <Counter2 />
    </Provider>
  )

  expect(getByText(/value:/)).toHaveTextContent('value: 0')

  Simulate.click(getByText(/increase value/))
  expect(getByText(/value:/)).toHaveTextContent('value: 1')
  Simulate.click(getByText(/increase value/))
  expect(getByText(/value:/)).toHaveTextContent('value: 2')
  expect(getByText(/value2:/)).toHaveTextContent('value2: 2')
})
