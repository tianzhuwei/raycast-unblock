import { proxy } from 'valtio'

export const MutateState = proxy({
  users: false,
  models: false,
})
