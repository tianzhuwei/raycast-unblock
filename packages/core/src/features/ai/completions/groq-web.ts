import type { FastifyReply, FastifyRequest } from 'fastify'
import consola from 'consola'
import { getConfig } from '../../../utils/env.util'
import { generateGroqWebRequestHeader } from '../../../services/groq-web'
import { groqClient } from '../../../utils'
import { GROQ_API_COMPLETIONS, GROQ_API_ENDPOINT } from '../../../services/groq-web/constants'
import { PreUniversalAICompletions, UniversalAICompletions } from './universal'

export async function GroqWebCompletions(request: FastifyRequest, reply: FastifyReply) {
  const config = getConfig('ai')?.groq
  const body = (await PreUniversalAICompletions(request, config)).body

  const headers = await generateGroqWebRequestHeader()

  const res = await groqClient.native(`${GROQ_API_ENDPOINT}${GROQ_API_COMPLETIONS}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
    .catch((e: any) => {
      consola.error(`[Groq-Web] Request error: ${e}.`)
      throw new Error(`Request error: ${e.message}`)
    })

  if (!res.ok) {
    consola.error(`[Groq-Web] Request error: ${res.statusText}.`)
    throw new Error(`Request error: ${res.statusText}`)
  }

  return UniversalAICompletions(reply, res)
}
