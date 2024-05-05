import type { RaycastAIModels, User } from '@ru/shared'
import { proxy } from 'valtio'

type _User = User & {
  lastSync: string
}

export const globalState = proxy({
  isShowingDetail: false,
  users: {
    users: [],
  } as {
    users: _User[]
  },
  models: {
    default_models: {},
    models: [],
  } as {
    default_models: Record<string, string>
    models: RaycastAIModels
  },
})
