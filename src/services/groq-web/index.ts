import { groqClient } from '../../utils'
import { getCache, setCache } from '../../utils/cache.util'
import { getConfig } from '../../utils/env.util'
import { Debug } from '../../utils/log.util'
import { GROQ_API_USER_PROFILE, GROQ_REFRESH_TOKEN_API, GROQ_X_SDK_CLIENT } from './constants'
import type { TokenResponse, UserProfile } from './types'

const debug = Debug.create('Groq')

interface GroqWebCache {
  jwt?: string
  expiresAt?: Date
  orgId?: string
}

async function getUserProfile() {
  return await groqClient<UserProfile>(GROQ_API_USER_PROFILE, {
    headers: {
      authorization: `Bearer ${(await getGroqCacheAndAutoRefresh()).jwt}`,
    },
  })
}

async function refreshJWT() {
  const refreshToken = getConfig('ai')?.groq?.refreshToken
  if (!refreshToken)
    throw new Error(`ai.groq.refresh_token not configured yet`)
  if (refreshToken.includes('Basic '))
    refreshToken.replace('Basic ', '')
  debug.info(`Fetching refreshedJwt`)
  const res = await groqClient<TokenResponse>(GROQ_REFRESH_TOKEN_API, {
    method: 'POST',
    body: {},
    headers: {
      'Authorization': `Basic ${refreshToken}`,
      'origin': 'https://groq.com',
      'referer': 'https://groq.com/',
      'x-sdk-client': GROQ_X_SDK_CLIENT,
      'x-sdk-parent-host': 'https://groq.com',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    },
  })
  const newJwt = res.data.session_jwt
  const now = new Date()
  const expiresAt = new Date(now.setMinutes(now.getMinutes() + 5))
  const store = {
    jwt: newJwt,
    expiresAt,
    orgId: '',
  } as GroqWebCache
  setCache('groq', 'web', store)
  debug.info(`Fetch User Profile with new jwt and record orgId`)
  const orgId = (await getUserProfile()).user.orgs.data[0].id
  store.orgId = orgId
  setCache('groq', 'web', store)
  return store
}

async function getGroqCacheAndAutoRefresh() {
  const cache = getCache<GroqWebCache>('groq', 'web')
  if (!cache?.expiresAt || new Date(cache?.expiresAt).getTime() < Date.now()) {
    debug.info(`Groq cache expired.`)
    await refreshJWT()
    return await getGroqCacheAndAutoRefresh()
  }
  return cache
}

export async function generateGroqWebRequestHeader() {
  const cache = await getGroqCacheAndAutoRefresh() as GroqWebCache
  if (!cache.orgId || cache.orgId === '')
    throw new Error(`OrgId is empty.`)

  return {
    'Authorization': `Bearer ${cache.jwt}`,
    'Groq-App': 'chat',
    'Groq-Organization': cache.orgId!,
    'Origin': 'https://groq.com',
    'Referer': 'https://groq.com/',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  }
}
