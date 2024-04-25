import type { FastifyReply, FastifyRequest } from 'fastify'
import destr from 'destr'
import type { RaycastCompletions } from '@ru/shared'
import { getConfig } from '../../../utils/env.util'
import { processStream } from '../../../utils/stream-reader.util'

/**
 * Prepare the request body for the AI
 * @param request Fastify request
 * @param config the settings for the AI
 * @param reqBody any additional request body
 * @returns the request body and temperature
 */
export async function PreUniversalAICompletions(request: FastifyRequest, config?: any, reqBody?: Record<string, any>) {
  const body = request.body as RaycastCompletions
  const aiConfig = getConfig('ai')
  let temperature = config?.temperature || aiConfig?.temperature || 0.5
  const requestBody = {
    messages: [] as {
      role: string
      content: string
    }[],
    model: body.model,
    temperature,
    top_p: 1,
    stream: true,
    max_tokens: config?.maxTokens || aiConfig?.maxTokens,
    ...reqBody,
  }

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

  return {
    body: requestBody,
    temperature,
  }
}

/**
 * Handle the AI completions into a stream response
 * @param reply Fastify reply
 * @param streamRequest the request to the AI
 */
export async function UniversalAICompletions(reply: FastifyReply, streamRequest: any) {
  const completions = processStream(streamRequest).stream
  return reply.sse((async function * source() {
    try {
      for await (const data of completions) {
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
