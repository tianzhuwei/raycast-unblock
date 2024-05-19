import { getPreferenceValues } from '@raycast/api'
import type { Preferences } from '../types/Preference'

export function build(path: string) {
  const preferences = getPreferenceValues<Preferences>()
  return {
    url: `${preferences.apiUrl.replace(/\/$/, '')}${path}`,
    // This method is invalid because Raycast will warn you "Self-signed SSL certificate"
    // url: `https://backend.raycast.com${path}`,
    token: preferences.accessToken,
  }
}
