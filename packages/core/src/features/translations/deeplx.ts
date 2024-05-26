import type { FastifyRequest } from 'fastify'
import type { SourceLang, TargetLang } from '@ifyour/deeplx/dist/types'
import type { AvaliableDeepLXEndpoints, TranslateFrom, TranslateTo } from '@ru/shared'
import { ofetch } from 'ofetch'
import { query } from '@ifyour/deeplx'
import { getConfig } from '../../utils/env.util'
import { getStore } from '../../utils/store.util'
import { Debug } from '../../utils/log.util'

export async function TranslateWithDeepLX(request: FastifyRequest): Promise<TranslateTo> {
  const debug = Debug.create('features:translations:deeplx')
  const body = request.body as TranslateFrom
  const config = getConfig('translate')?.deeplx
  const concurrencyNumber = config?.concurrency || 2

  const storeEndpoints = getStore<{
    availableEndpoints: AvaliableDeepLXEndpoints
  } | undefined>('deeplx')

  const endpoints = config?.proxyEndpoints?.map((v, i) => ({
    proxyEndpoint: v,
    accessToken: config.accessTokens?.[i],
  })) || []
  const availableEndpoints = storeEndpoints?.availableEndpoints || endpoints

  if (availableEndpoints.length === 0) {
    debug.info(`Use default endpoint.`)
    const res = await query({
      text: body.q,
      source_lang: body.source as SourceLang,
      target_lang: body.target as TargetLang,
    })
    return {
      data: {
        translations: [
          {
            translatedText: res.data!,
            detectedSourceLanguage: body.source,
          },
        ],
      },
    }
  }

  // Randomly select concurrencyNumber endpoints
  const selectedEndpoints = availableEndpoints.sort(() => Math.random() - 0.5).slice(0, concurrencyNumber)

  const abortController = new AbortController()
  const abortSignal = abortController.signal
  const promises = selectedEndpoints.map(async (endpoint) => {
    return ofetch(endpoint.proxyEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(endpoint.accessToken?.length) && {
          Authorization: `Bearer ${endpoint.accessToken}`,
        },
      },
      body: {
        text: body.q,
        source_lang: body.source as SourceLang,
        target_lang: body.target as TargetLang,
      },
      signal: abortSignal,
    }).then((v) => {
      return {
        endpoint: endpoint.proxyEndpoint,
        data: v.data,
        source_lang: body.source,
      }
    }).catch(() => false)
  })

  const fastestValue = await Promise.race(promises) as { endpoint: string, data: string, source_lang: string } | false
  abortController.abort('Translation request finished')

  if (fastestValue) {
    debug.success(`Fastest endpoint: ${fastestValue.endpoint}.`)
    debug.info(`This around request endpoints: ${selectedEndpoints.map(v => v.proxyEndpoint).join(', ')}`)
    return {
      data: {
        translations: [
          {
            translatedText: fastestValue.data,
            detectedSourceLanguage: fastestValue.source_lang,
          },
        ],
      },
    }
  }
  else {
    return {
      data: {
        translations: [
          {
            translatedText: '[Error] No avaliable response.',
            detectedSourceLanguage: body.source,
          },
        ],
      },
    }
  }
}
