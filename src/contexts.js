import React from 'react'

let contexts = {}

export function createContext(name, store) {
  return contexts[name] = React.createContext(store)
}

export function getContext(name) {
  return contexts[name]
}
