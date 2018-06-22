/* eslint react/no-multi-comp: 0 */
import React from 'react';
import 'dom-testing-library/extend-expect';
import {render, Simulate, wait} from 'react-testing-library';
import Provider from '../Provider';
import injectStore from '../injectStore';

test('simple render of the value', () => {
  const Counter = injectStore('counter')(
    ({counter}) => {
      return <div>counter value: {counter.value}</div>;
    }
  );
  const {getByText} = render(
    <Provider stores={{counter: {value: 0}}}><Counter /></Provider>
  );

  expect(getByText(/value:/)).toHaveTextContent('value: 0');
});

test('value changes after method call', () => {
  const store = {
    increase () {
      this.value++;
    },
    value: 0
  };
  const Counter = injectStore('counter')(
    ({counter}) => {
      return <div>
        <div>value: {counter.value}</div>
        <button onClick={counter.increase}>increase value</button>
      </div>;
    }
  );
  const {getByText} = render(
    <Provider stores={{counter: store}}><Counter /></Provider>
  );

  expect(getByText(/value:/)).toHaveTextContent('value: 0');

  Simulate.click(getByText(/increase value/));
  expect(getByText(/value:/)).toHaveTextContent('value: 1');
});

test('intermediate components do not rerender', () => {
  const store = {
    increase () {
      this.value++;
    },
    value: 0
  };
  const Counter = injectStore('counter')(
    ({counter}) => {
      return <div>
        <div>value: {counter.value}</div>
        <button onClick={counter.increase}>increase value</button>
      </div>;
    }
  );
  let renderCounts = 0;

  class Intermediate extends React.Component {
    render () {
      renderCounts++;

      return this.props.children;
    }
  }

  const {getByText} = render(
    <Provider stores={{counter: store}}>
      <Intermediate>
        <Counter />
      </Intermediate>
    </Provider>
  );

  Simulate.click(getByText(/increase value/));
  Simulate.click(getByText(/increase value/));
  expect(getByText(/value:/)).toHaveTextContent('value: 2');
  expect(renderCounts).toEqual(1);
});

test('components can be injected with multiple stores', () => {
  const store = {
    increase () {
      this.value++;
    },
    value: 0
  };
  const store2 = {
    increase () {
      this.value += 2;
    },
    value: 0
  };

  const store3 = {
    increase () {
      this.value += 3;
    },
    value: 0
  };
  const Counter = injectStore('counter', 'doubleCounter', 'tripleCounter')(
    ({counter, doubleCounter, tripleCounter}) => {
      return <div>
        <div>values: {counter.value}:{doubleCounter.value}:{tripleCounter.value}</div>
        <button onClick={counter.increase}>increase counter</button>
        <button onClick={doubleCounter.increase}>increase doubleCounter</button>
        <button onClick={tripleCounter.increase}>increase tripleCounter</button>

      </div>;
    }
  );
  const {getByText} = render(
    <Provider stores={{
      counter: store,
      doubleCounter: store2,
      tripleCounter: store3
    }}>
      <Counter />
    </Provider>
  );

  Simulate.click(getByText(/increase counter/));
  expect(getByText(/values:/)).toHaveTextContent('1:0:0');

  Simulate.click(getByText(/increase doubleCounter/));
  expect(getByText(/values:/)).toHaveTextContent('1:2:0');

  Simulate.click(getByText(/increase tripleCounter/));
  expect(getByText(/values:/)).toHaveTextContent('1:2:3');
});

test('injected components rerender independently', () => {
  const store = {
    increase () {
      this.value++;
    },
    value: 0
  };
  const store2 = {
    increase () {
      this.value += 2;
    },
    value: 0
  };
  let renderedCounter = 0;
  let renderedDoubleCounter = 0;

  const Counter = injectStore('counter')(
    ({counter}) => {
      renderedCounter++;

      return <div>
        <button onClick={counter.increase}>increase counter</button>
      </div>;
    }
  );
  const DoubleCounter = injectStore('doubleCounter')(
    ({doubleCounter}) => {
      renderedDoubleCounter++;

      return <div>
        <button onClick={doubleCounter.increase}>increase doubleCounter</button>
      </div>;
    }
  );

  const {getByText} = render(
    <Provider stores={{
      counter: store,
      doubleCounter: store2
    }}>
      <Counter />
      <DoubleCounter />
    </Provider>
  );

  expect([renderedCounter, renderedDoubleCounter]).toEqual([1, 1]);

  Simulate.click(getByText(/increase counter/));
  expect([renderedCounter, renderedDoubleCounter]).toEqual([2, 1]);

  Simulate.click(getByText(/increase doubleCounter/));
  expect([renderedCounter, renderedDoubleCounter]).toEqual([2, 2]);
});

test('support class methods', () => {
  class CounterStore {
    value = 0
    increase () {
      this.value++;
    }
  }
  const Counter = injectStore('counter')(
    ({counter}) => {
      return <div>
        <div>value: {counter.value}</div>
        <button onClick={counter.increase}>increase value</button>
      </div>;
    }
  );
  const {getByText} = render(
    <Provider stores={{counter: new CounterStore()}}><Counter /></Provider>
  );

  expect(getByText(/value:/)).toHaveTextContent('value: 0');

  Simulate.click(getByText(/increase value/));
  expect(getByText(/value:/)).toHaveTextContent('value: 1');
});

test('support async class methods', async () => {
  const getDataAsync = function () {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(77);
      }, 200);
    });
  };

  class Store {
    value = 0
    async changeData () {
      this.value = await getDataAsync();
    }
  }
  const Counter = injectStore('counter')(
    ({counter}) => {
      return <div>
        <div>value: {counter.value}</div>
        <button onClick={counter.changeData}>change value</button>
      </div>;
    }
  );
  const {getByText} = render(
    <Provider stores={{counter: new Store()}}><Counter /></Provider>
  );

  expect(getByText(/value:/)).toHaveTextContent('value: 0');

  Simulate.click(getByText(/change value/));
  await wait(() => {
    expect(getByText(/value:/)).toHaveTextContent('value: 77');
  }, {timeout: 300});
});

test('method returns after state change', async () => {
  let methodResult;
  let counterValueAfterMethod;

  class Store {
    value = 0
    changeData () {
      this.value = 77;

      return 42;
    }
  }

  class Comp extends React.Component {
    handleClick = async () => {
      methodResult = await this.props.counter.changeData();
      counterValueAfterMethod = this.props.counter.value;
    }

    render () {
      return <div>
        <div>value: {this.props.counter.value}</div>
        <button onClick={this.handleClick}>change value</button>
      </div>;
    }
  }
  const Counter = injectStore('counter')(Comp);

  const {getByText} = render(
    <Provider stores={{counter: new Store()}}><Counter /></Provider>
  );

  expect(getByText(/value:/)).toHaveTextContent('value: 0');

  Simulate.click(getByText(/change value/));
  await wait();
  expect(methodResult).toEqual(42);
  expect(counterValueAfterMethod).toEqual(77);

  expect(getByText(/value:/)).toHaveTextContent('value: 77');
});
