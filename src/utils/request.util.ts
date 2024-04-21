import consola from 'consola'
import type { $Fetch } from 'ofetch'
import { ofetch } from 'ofetch'
import { GROQ_API_ENDPOINT } from '../services/groq-web/constants'
import { COHERE_API_ENDPOINT } from '../services/cohere-web/constants'
import { Debug } from './log.util'

export const httpClient: $Fetch = ofetch.create({
  baseURL: 'https://backend.raycast.com/api/v1',
  headers: {
    'x-raycast-unblock': 'true',
  },
  onRequestError: (ctx) => {
    consola.error(`[Raycast Backend] Request error`)
    console.error(ctx)
  },
})

export const groqClient: $Fetch = ofetch.create({
  baseURL: GROQ_API_ENDPOINT,
  onRequest: (ctx) => {
    Debug.info(`[Groq] Request: ${ctx.request}`)
  },
  onRequestError: (ctx) => {
    consola.error(`[Groq] Request error`)
    console.error(ctx)
  },
})

export const cohereClient: $Fetch = ofetch.create({
  baseURL: COHERE_API_ENDPOINT,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  },
  onRequest: (ctx) => {
    Debug.info(`[Cohere] Request: ${ctx.request}`)
  },
  onRequestError: (ctx) => {
    consola.error(`[Cohere] Request error`)
    console.error(ctx)
  },
  onResponseError: (ctx) => {
    consola.error(`[Cohere] Response error`)
    console.error(ctx)
  },
})

export async function getBackendResponse(
  url: string,
  headers = {},
  method?: string,
  data?: any,
) {
  headers = {
    ...headers,
    host: 'backend.raycast.com',
  }
  return await httpClient(url, {
    headers,
    method: method || 'GET',
    body: data ? JSON.stringify(data) : undefined,
  })
}
