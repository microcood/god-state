# god-state

A small wrapper over React's Context API to simplify state management.

---


#### Example usage


Wrap your components with ```Provider``` and pass in some stores
```js
import { Provider } from 'god-state'

const App = ({ children }) => (
  <Provider stores={{
    counter: { value: 0 }
  }}>
    {children}
  </Provider>
)
```

Then use stores by name anywhere in the app:

```js
import { useStore } from 'god-state'

const CounterComponent = () => {
  const [counter, changeCounter] = useStore('counter')
  const increase = () => changeCounter({ value: counter.value + 1 })
  const decrease = () => changeCounter({ value: counter.value - 1 })

  return <div>
    Counter value: {counter.value}
    <button onClick={increase}>increase</button>
    <button onClick={decrease}>decrease</button>
  </div>
}
```