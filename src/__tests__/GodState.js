/* eslint react/no-multi-comp: 0 */
import React from 'react';
import 'dom-testing-library/extend-expect';
import {render, Simulate, wait} from 'react-testing-library';
import Provider from '../Provider';
import injectStore from '../injectStore';
import {createStore, useStore} from '../newVersion';

test('simple render of the value', () => {
  createStore('counter', {value: 0});
  const Counter = () => {
    const [counter] = useStore('counter');

    return <div>counter value: {counter.value}</div>;
  };
  const {getByText} = render(
    <Counter />
  );

  expect(getByText(/value:/)).toHaveTextContent('value: 0');
});

test('value changes after method call', () => {
  createStore('counter', {value: 0});
  const Counter = () => {
    const [counter, changeCounter] = useStore('counter');
    const increase = function () {
      changeCounter({value: counter.value + 1});
    };

    return <div>
      <div>value: {counter.value}</div>
      <button onClick={increase}>increase value</button>
    </div>;
  };
  const {getByText} = render(
    <Counter />
  );

  expect(getByText(/value:/)).toHaveTextContent('value: 0');

  Simulate.click(getByText(/increase value/));
  expect(getByText(/value:/)).toHaveTextContent('value: 1');
});

test('intermediate components do not rerender', () => {
  createStore('counter', {value: 0});
  const Counter = () => {
    const [counter, changeCounter] = useStore('counter');
    const increase = function () {
      changeCounter({value: counter.value + 1});
    };

    return <div>
      <div>value: {counter.value}</div>
      <button onClick={increase}>increase value</button>
    </div>;
  };
  let renderCounts = 0;

  class Intermediate extends React.Component {
    render () {
      renderCounts++;

      return this.props.children;
    }
  }

  const {getByText} = render(
    <Intermediate>
      <Counter />
    </Intermediate>
  );

  Simulate.click(getByText(/increase value/));
  Simulate.click(getByText(/increase value/));
  expect(getByText(/value:/)).toHaveTextContent('value: 2');
  expect(renderCounts).toEqual(1);
});

test('components can be injected with multiple stores', () => {
  createStore('counter', {value: 0});
  createStore('doubleCounter', {value: 0});
  createStore('tripleCounter', {value: 0});

  const Counter = () => {
    const [counter, changeCounter] = useStore('counter');
    const increase = function () {
      changeCounter({value: counter.value + 1});
    };

    const [doubleCounter, changeDoubleCounter] = useStore('doubleCounter');
    const doubleIncrease = function () {
      changeDoubleCounter({value: doubleCounter.value + 2});
    };

    const [tripleCounter, changeTripleCounter] = useStore('tripleCounter');
    const tripleIncrease = function () {
      changeTripleCounter({value: tripleCounter.value + 3});
    };

    return <div>
      <div>values: {counter.value}:{doubleCounter.value}:{tripleCounter.value}</div>
      <button onClick={increase}>increase counter</button>
      <button onClick={doubleIncrease}>increase doubleCounter</button>
      <button onClick={tripleIncrease}>increase tripleCounter</button>

    </div>;
  };
  const {getByText} = render(
    <Counter />
  );

  Simulate.click(getByText(/increase counter/));
  expect(getByText(/values:/)).toHaveTextContent('1:0:0');

  Simulate.click(getByText(/increase doubleCounter/));
  expect(getByText(/values:/)).toHaveTextContent('1:2:0');

  Simulate.click(getByText(/increase tripleCounter/));
  expect(getByText(/values:/)).toHaveTextContent('1:2:3');
});

test('injected components rerender independently', () => {
  createStore('counter', {value: 0});
  createStore('doubleCounter', {value: 0});
  let renderedCounter = 0;
  let renderedDoubleCounter = 0;

  const Counter = () => {
    const [counter, changeCounter] = useStore('counter');
    const increase = function () {
      changeCounter({value: counter.value + 1});
    };

    renderedCounter++;

    return <div>
      <button onClick={increase}>increase counter</button>
    </div>;
  };
  const DoubleCounter = () => {
    const [doubleCounter, changeDoubleCounter] = useStore('doubleCounter');
    const doubleIncrease = function () {
      changeDoubleCounter({value: doubleCounter.value + 2});
    };

    renderedDoubleCounter++;

    return <div>
      <button onClick={doubleIncrease}>increase doubleCounter</button>
    </div>;
  };

  const {getByText} = render(
    <div>
      <Counter />
      <DoubleCounter />
    </div>
  );

  expect([renderedCounter, renderedDoubleCounter]).toEqual([1, 1]);

  Simulate.click(getByText(/increase counter/));
  expect([renderedCounter, renderedDoubleCounter]).toEqual([2, 1]);

  Simulate.click(getByText(/increase doubleCounter/));
  expect([renderedCounter, renderedDoubleCounter]).toEqual([2, 2]);
});

test('custom hook support', () => {
  createStore('counter', {value: 0});
  const useCounter = function () {
    const [counter, changeCounter] = useStore('counter');
    const increase = function () {
      changeCounter({value: counter.value + 1});
    };

    return {
      ...counter,
      increase
    };
  };
  const Counter = () => {
    const counter = useCounter();

    return <div>
      <div>value: {counter.value}</div>
      <button onClick={counter.increase}>increase value</button>
    </div>;
  };
  const {getByText} = render(
    <Counter />
  );

  expect(getByText(/value:/)).toHaveTextContent('value: 0');

  Simulate.click(getByText(/increase value/));
  expect(getByText(/value:/)).toHaveTextContent('value: 1');
  Simulate.click(getByText(/increase value/));
  expect(getByText(/value:/)).toHaveTextContent('value: 2');
});

// test('support class methods', () => {
//   class CounterStore {
//     value = 0
//     increase () {
//       this.value++;
//     }
//   }
//   const Counter = injectStore('counter')(
//     ({counter}) => {
//       return <div>
//         <div>value: {counter.value}</div>
//         <button onClick={counter.increase}>increase value</button>
//       </div>;
//     }
//   );
//   const {getByText} = render(
//     <Provider stores={{counter: new CounterStore()}}><Counter /></Provider>
//   );

//   expect(getByText(/value:/)).toHaveTextContent('value: 0');

//   Simulate.click(getByText(/increase value/));
//   expect(getByText(/value:/)).toHaveTextContent('value: 1');
// });

// test('support async class methods', async () => {
//   const getDataAsync = function () {
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         resolve(77);
//       }, 200);
//     });
//   };

//   class Store {
//     value = 0
//     async changeData () {
//       this.value = await getDataAsync();
//     }
//   }
//   const Counter = injectStore('counter')(
//     ({counter}) => {
//       return <div>
//         <div>value: {counter.value}</div>
//         <button onClick={counter.changeData}>change value</button>
//       </div>;
//     }
//   );
//   const {getByText} = render(
//     <Provider stores={{counter: new Store()}}><Counter /></Provider>
//   );

//   expect(getByText(/value:/)).toHaveTextContent('value: 0');

//   Simulate.click(getByText(/change value/));
//   await wait(() => {
//     expect(getByText(/value:/)).toHaveTextContent('value: 77');
//   }, {timeout: 300});
// });

// test('method returns after state change', async () => {
//   let methodResult;
//   let counterValueAfterMethod;

//   class Store {
//     value = 0
//     changeData () {
//       this.value = 77;

//       return 42;
//     }
//   }

//   class Comp extends React.Component {
//     handleClick = async () => {
//       methodResult = await this.props.counter.changeData();
//       counterValueAfterMethod = this.props.counter.value;
//     }

//     render () {
//       return <div>
//         <div>value: {this.props.counter.value}</div>
//         <button onClick={this.handleClick}>change value</button>
//       </div>;
//     }
//   }
//   const Counter = injectStore('counter')(Comp);

//   const {getByText} = render(
//     <Provider stores={{counter: new Store()}}><Counter /></Provider>
//   );

//   expect(getByText(/value:/)).toHaveTextContent('value: 0');

//   Simulate.click(getByText(/change value/));
//   await wait();
//   expect(methodResult).toEqual(42);
//   expect(counterValueAfterMethod).toEqual(77);

//   expect(getByText(/value:/)).toHaveTextContent('value: 77');
// });
