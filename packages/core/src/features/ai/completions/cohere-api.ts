import type { FastifyReply, FastifyRequest } from 'fastify'
import { CohereClient } from 'cohere-ai'
import type { ChatMessageRole } from 'cohere-ai/api'
import type { RaycastCompletions } from '@ru/shared'
import { getConfig } from '../../../utils/env.util'
import { Debug } from '../../../utils/log.util'

import { PreUniversalAICompletions } from './universal'

export async function CohereAPICompletions(request: FastifyRequest, reply: FastifyReply) {
  const config = getConfig('ai')?.cohere
  if (!config?.apiKey)
    throw new Error('API key is required for Cohere API')

  const debug = Debug.create('features:ai:completions:cohere-api')
  const cohere = new CohereClient({
    token: config?.apiKey,
  })
  const preUniversalAICompletions = await PreUniversalAICompletions(request, config)
  const body = preUniversalAICompletions.body
  const chat = body.messages
  debug.info(`Handling completions for model: ${body.model}`)
  const chatHistory = chat.map((message) => {
    if (message.role === 'assistant') {
      return {
        role: 'CHATBOT' as ChatMessageRole,
        message: message.content,
      }
    }
    else {
      return {
        role: message.role.toUpperCase() as ChatMessageRole,
        message: message.content,
      }
    }
  })

  const raycastBody = request.body as RaycastCompletions

  const chatStream = await cohere.chatStream({
    model: body.model,
    p: body.top_p,
    temperature: body.temperature,
    chatHistory: chatHistory.slice(0, -1), // Remove the last message
    message: chatHistory[chatHistory.length - 1].message, // The last message
    maxTokens: body.max_tokens,
    connectors: [
      ...raycastBody.web_search_tool
        ? [{
            id: 'web-search',
          }]
        : [],
    ],
  })

  return reply.sse((async function* source() {
    try {
      for await (const message of chatStream) {
        switch (message.eventType) {
          case 'text-generation': {
            const res = {
              text: message.text,
              finish_reason: 'continue',
            }
            yield { data: JSON.stringify(res) }
            break
          }
          case 'stream-end': {
            const res = {
              text: '',
              finish_reason: 'stop',
            }
            yield { data: JSON.stringify(res) }
            break
          }
          case 'search-results': {
            const references = [] as Array<{
              title: string
              description: string
              url: string
            }>
            message.documents?.forEach((doc) => {
              references.push({
                title: doc.title,
                description: doc.description,
                url: doc.url,
              })
            })
            const res = {
              references,
              text: '',
            }
            yield { data: JSON.stringify(res) }
          }
        }
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
      // console.log('finally')
      const res = {
        text: '',
        finish_reason: 'stop',
      }
      yield { data: JSON.stringify(res) }
    }
  })())
}
