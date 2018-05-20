import React from 'react';
import 'dom-testing-library/extend-expect';
import {render} from 'react-testing-library';
import Provider from '../Provider';
import injectStore from '../injectStore';

const dom = React.createElement;

const counter = {
  increase () {
    this.value++;
  },
  value: 0
};

const provider = (props) => {
  return dom(Provider, {stores: {counter}}, props.children);
};
const displayValue = (props) => {
  return dom('div', {}, [`value: ${props.counter.value}`]);
};

test('simple render of the value', () => {
  const {getByText} = render(
    dom(provider, {}, [
      dom(injectStore('counter')(displayValue), {key: 234})
    ])
  );

  expect(getByText(/value:/)).toHaveTextContent('value: 0');
});
