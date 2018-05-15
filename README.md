# god-state

A small wrapper over React's Context API to simplify state management.

---


#### Example usage


Wrap your components with ```Provider``` and pass into some stores (named objects with data and methods modifying it):

```js
import { Provider } from 'god-state';

const counter = {
  value: 0,
  increase: function() { this.value++ },
  decrease: function() { this.value-- }
}

class App extends React.Component {
  render() {
    return <Provider stores={{ counter, }}>
      {this.props.children}
    </Provider>
  }
}
```

Then inject stores by name to use them anywhere in the app:

```js
import { injectStore } from 'god-state';

@injectStore('counter')
class CounterComponent extends React.Component {
  render() {
    const { counter } = this.props
    return <div>
      Counter value: {counter.value}
      <button onClick={counter.increase}>increase</button>
      <button onClick={counter.decrease}>decrease</button>
    </div>
  }
}
```