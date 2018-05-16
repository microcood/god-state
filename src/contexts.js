import React from 'react'

let contexts = {}

export function createContext (name, store) {
  contexts[name] = React.createContext(store)
  return contexts[name]
}

export function getContext (name) {
  return contexts[name]
}
