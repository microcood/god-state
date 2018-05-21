import React from 'react';
import 'dom-testing-library/extend-expect';
import {render} from 'react-testing-library';
import Provider from '../Provider';
import injectStore from '../injectStore';

const counter = {
  increase () {
    this.value++;
  },
  value: 0
};

test('simple render of the value', () => {
  const Counter = injectStore('counter')(
    (props) => {
      return <div>counter value: {props.counter.value}</div>;
    }
  );
  const {getByText} = render(
    <Provider stores={{counter}}><Counter /></Provider>
  );

  expect(getByText(/value:/)).toHaveTextContent('value: 0');
});
