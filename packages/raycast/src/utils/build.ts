import { getPreferenceValues } from '@raycast/api'
import type { Preferences } from '../types/Preference'

export function build(path: string) {
  const preferences = getPreferenceValues<Preferences>()
  return {
    url: `${preferences.apiUrl.replace(/\/$/, '')}${path}`,
    token: preferences.accessToken,
  }
}
