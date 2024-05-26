import type { AvaliableDeepLXEndpoints } from '@ru/shared'
import consola from 'consola'
import { ofetch } from 'ofetch'
import { getConfig } from '../utils/env.util'
import { Debug } from '../utils/log.util'
import { setStore } from '../utils/store.util'

async function check(endpoint: string, accessToken?: string) {
  return await ofetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken?.length) && {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    body: ({
      text: 'Hello',
      source_lang: 'en',
      target_lang: 'zh',
    }),
    timeout: 5000,
  }).then((v) => {
    return v.data.length > 0
  }).catch(() => false)
}

export async function checkDeepLXEndpoints() {
  const logger = consola.withTag('cron:check-deeplx-endpoints')
  const debug = Debug.create('cron:check-deeplx-endpoints')

  const defaultService = getConfig('translate')?.default
  if (defaultService !== 'deeplx')
    return

  const config = getConfig('translate')?.deeplx
  if (!config)
    return

  if (config.checkAvailable === false)
    return
  logger.info('Checking DeepLX endpoints availability...')

  const availableEndpoints: AvaliableDeepLXEndpoints = []
  const unavailableEndpoints: AvaliableDeepLXEndpoints = []

  const endpoints = config.proxyEndpoints
  const accessToken = config.accessTokens

  if (!endpoints)
    return

  const promises = endpoints.map(async (endpoint, index) => {
    debug.info(`Checking endpoint: ${endpoint}`)
    const isAvailable = await check(endpoint, accessToken?.[index])
    if (isAvailable) {
      debug.success(`Endpoint: ${endpoint} is available`)
      availableEndpoints.push({ proxyEndpoint: endpoint, accessToken: accessToken?.[index] })
    }
    else {
      unavailableEndpoints.push({ proxyEndpoint: endpoint, accessToken: accessToken?.[index] })
    }
  })

  await Promise.all(promises)

  logger.info(`Available DeepLX endpoints: ${availableEndpoints.length}`)
  logger.info(`Unavailable DeepLX endpoints: ${unavailableEndpoints.length}`)
  if (unavailableEndpoints.length > 0) {
    logger.warn(`Following DeepLX endpoints are unavailable:`)
    logger.log(`
${unavailableEndpoints.map(v => `Proxy: ${v.proxyEndpoint} | AccessToken: ${v.accessToken}`).join('\n')}
    `)
  }

  setStore('deeplx', {
    availableEndpoints,
  })

  return availableEndpoints
}
