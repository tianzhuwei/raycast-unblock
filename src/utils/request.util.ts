import consola from 'consola'
import type { $Fetch } from 'ofetch'
import { ofetch } from 'ofetch'
import { GROQ_API_ENDPOINT } from '../services/groq-web/constants'
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
