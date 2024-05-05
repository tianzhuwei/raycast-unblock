import { List, getPreferenceValues } from '@raycast/api'
import { showFailureToast, useFetch } from '@raycast/utils'
import { useSnapshot } from 'valtio'
import { useEffect } from 'react'
import type { RaycastAIModels } from '@ru/shared'
import type { Preferences } from './types/Preference'
import { Users } from './components/Users'
import { globalState } from './state/global'
import { Models } from './components/Models'
import { MutateState } from './state/mutate'
import { build } from './utils/build'
import { API_MODELS, API_USERS } from './constants'

export function Home() {
  const preferences = getPreferenceValues<Preferences>()
  const { isShowingDetail } = useSnapshot(globalState)
  const mutateState = useSnapshot(MutateState)
  const { isLoading, data: usersData } = useFetch<{
    users: any[]
  }>(build(API_USERS).url, {
    headers: {
      token: build(API_USERS).token,
    },
  })
  const { data: modelsData, revalidate } = useFetch<{
    default_models: Record<string, string>
    models: RaycastAIModels
  }>(build(API_MODELS).url, {
    headers: {
      token: build(API_MODELS).token,
    },
  })

  useEffect(() => {
    if (!preferences.apiUrl.startsWith('http'))
      showFailureToast('Invalid API URL')
  }, [preferences])

  useEffect(() => {
    switch (true) {
      case mutateState.users:
        break
      case mutateState.models:
        revalidate()
        MutateState.models = false
        break
    }
  }, [mutateState])

  useEffect(() => {
    globalState.users = usersData || { users: [] }
    globalState.models = modelsData || { default_models: {}, models: [] }
  }, [usersData, modelsData])

  return (
    <List isShowingDetail={isShowingDetail} isLoading={isLoading}>
      <Users />
      <Models />
    </List>
  )
}

export default function Command() {
  return <Home />
}
