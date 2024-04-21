import jwt from 'jsonwebtoken'
import { cohereClient } from '../../utils'
import { getCache, setCache } from '../../utils/cache.util'
import { getConfig } from '../../utils/env.util'
import { Debug } from '../../utils/log.util'
import { COHERE_API_AuthV2, COHERE_API_GET_OR_CREATE_DEFAULT_API_KEY, COHERE_API_Session } from './constants'
import type { CohereWebAuthV2Body, CohereWebAuthV2Response, CohereWebGetOrCreateDefaultAPIKeyResponse } from './types'

async function checkCacheTokenIsExpired() {
  const tokens = getCache<CohereWebAuthV2Response>('cohere', 'web')
  if (!tokens)
    return true

  const token = tokens.bearerTokens
  const decoded = jwt.decode(token.accessToken) as { exp: number }
  const expiredInTime = decoded.exp * 1000 < Date.now()

  if (!expiredInTime) {
    const res = await cohereClient(COHERE_API_Session, {
      method: 'POST',
      body: {},
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
      },
    }).then(() => false).catch(() => true)
    return res
  }

  return true
}

export async function cohereWebLogin(force = false): Promise<CohereWebAuthV2Response | undefined> {
  const config = getConfig('ai')?.cohere
  if (!config)
    return

  const debug = Debug.create('cohere-web')
  debug.info('Logging in to cohere...')

  const tokens = getCache<CohereWebAuthV2Response>('cohere', 'web')

  if (tokens && !force && !await checkCacheTokenIsExpired()) {
    debug.info(`Cached tokens found. Skipping login. UserID: ${tokens.bearerTokens.userID}`)
    return tokens
  }

  if (!config?.email || !config?.password)
    throw new Error('Cohere email and password are required for login')

  // Login to cohere
  const body = {
    email: config.email,
    password: config.password,
  } as CohereWebAuthV2Body

  const res = await cohereClient<CohereWebAuthV2Response>(COHERE_API_AuthV2, {
    method: 'POST',
    body,
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((res) => {
    debug.info(`Cohere login successful. UserID: ${res.bearerTokens.userID}`)
    return res
  })

  // Cache the tokens
  setCache('cohere', 'web', res)
  return res
}

export async function cohereWebGetOrCreateDefaultAPIKey(): Promise<CohereWebGetOrCreateDefaultAPIKeyResponse | undefined> {
  const config = getConfig('ai')?.cohere
  if (!config)
    return
  const debug = Debug.create('cohere-web')

  // Get or create default API key
  const res = await cohereClient<CohereWebGetOrCreateDefaultAPIKeyResponse>(COHERE_API_GET_OR_CREATE_DEFAULT_API_KEY, {
    method: 'POST',
    body: {},
    headers: await generateCohereWebRequestHeader(),
  }).then((res) => {
    debug.info(`Cohere default API key: ${res.rawKey}`)
    return res
  }).catch(async (err) => {
    if (err.status === 401) {
      debug.error('Cohere login failed. Retrying...')
      await generateCohereWebRequestHeader(true)
      return cohereWebGetOrCreateDefaultAPIKey()
    }
    throw err
  })

  if (res!.rawKey)
    setCache('cohere', 'defaultAPIKey', res!.rawKey)

  return res
}

export async function generateCohereWebRequestHeader(force = false) {
  const tokens = getCache<CohereWebAuthV2Response>('cohere', 'web')
  let needRetry = force

  if (!tokens || await checkCacheTokenIsExpired())
    needRetry = true

  if (needRetry) {
    await cohereWebLogin(needRetry)
    return await generateCohereWebRequestHeader() // Retry
  }

  return {
    'Request-Source': 'coral',
    'Authorization': `Bearer ${tokens!.bearerTokens.accessToken}`,
  }
}

export async function generateCohereWebChatHeader() {
  const rawKey = getCache<string>('cohere', 'defaultAPIKey')
  if (!rawKey) {
    await cohereWebGetOrCreateDefaultAPIKey()
    return await generateCohereWebChatHeader()
  }

  return {
    'Request-Source': 'coral',
    'Authorization': `Bearer ${rawKey}`,
    'Cohere-Version': '2022-12-06',
    'Content-Type': 'text/plain;charset=UTF-8',
    'dnt': '1',
  }
}
