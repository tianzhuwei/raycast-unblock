import type { FastifyReply, FastifyRequest } from 'fastify'
import consola from 'consola'
import destr from 'destr'
import { getConfig } from '../../../utils/env.util'
import type { RaycastCompletions } from '../../../types/raycast/completions'
import { generateGroqWebRequestHeader } from '../../../services/groq-web'
import { groqClient } from '../../../utils'
import { GROQ_API_COMPLETIONS, GROQ_API_ENDPOINT } from '../../../services/groq-web/constants'
import { processStream } from '../../../utils/stream-reader.util'

export async function GroqWebCompletions(request: FastifyRequest, reply: FastifyReply) {
  const body = request.body as RaycastCompletions
  const aiConfig = getConfig('ai')
  const config = getConfig('ai')?.groq

  let temperature = config?.temperature || aiConfig?.temperature || 0.5
  const requestBody = {
    messages: [] as any[],
    model: body.model,
    temperature,
    top_p: 1,
    stream: true,
    max_tokens: config?.maxTokens || aiConfig?.maxTokens,
  }
  const headers = await generateGroqWebRequestHeader()
  const messages = body.messages
  for (const message of messages) {
    if ('system_instructions' in message.content) {
      requestBody.messages.push(
        {
          role: 'system',
          content: message.content.system_instructions,
        },
      )
    }

    if ('command_instructions' in message.content) {
      requestBody.messages.push(
        {
          role: 'system',
          content: message.content.command_instructions,
        },
      )
    }

    if ('additional_system_instructions' in body) {
      requestBody.messages.push(
        {
          role: 'system',
          content: body.additional_system_instructions,
        },
      )
    }

    if ('text' in message.content) {
      requestBody.messages.push(
        {
          role: message.author,
          content: message.content.text,
        },
      )
    }

    if ('temperature' in message.content)
      temperature = message.content.temperature
  }

  const res = await groqClient.native(`${GROQ_API_ENDPOINT}${GROQ_API_COMPLETIONS}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody),
  })
    .catch((e: any) => {
      consola.error(`[Groq-Web] Request error: ${e.message}.`)
      throw new Error(`Request error: ${e.message}`)
    })

  if (!res.ok) {
    consola.error(`[Groq-Web] Request error: ${res.statusText}.`)
    throw new Error(`Request error: ${res.statusText}`)
  }

  const stream = processStream(res).stream as any

  return reply.sse((async function * source() {
    try {
      for await (const data of stream) {
        const json = destr(data) as any
        const res = {
          text: json.choices[0]?.delta.content || '',
        }
        yield { data: JSON.stringify(res) }
      }
    }
    catch (e: any) {
      console.error('Error: ', e.message)
      const res = {
        text: '',
        finish_reason: e.message,
      }
      yield { data: JSON.stringify(res) }
    }
    finally {
      const res = {
        text: '',
        finish_reason: 'stop',
      }
      yield { data: JSON.stringify(res) }
    }
  })())
}
