import React, {
  createContext,
  createElement,
  useContext,
  useState
} from 'react'
import { entries } from 'lodash'

const ctxs = {}

const registerService = (name, state) => {
  ctxs[name] = createContext()
  return function Provider({ children }) {
    const { Provider } = ctxs[name]
    const stateRes = useState(state)
    return <Provider value={stateRes}>{children}</Provider>
  }
}

export const useStore = name => useContext(ctxs[name])

export const Provider = ({ children, stores }) =>
  entries(stores).reduce(
    (acc, [key, state]) =>
      createElement(registerService(key, state), { key: `${key}Provider` }, [
        acc
      ]),
    children
  )
