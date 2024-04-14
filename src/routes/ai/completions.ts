import type { FastifyReply, FastifyRequest } from 'fastify'
import consola from 'consola'
import { getConfig } from '../../utils/env.util'
import { GeminiChatCompletion } from '../../features/ai/completions/gemini'
import { OpenAIChatCompletion } from '../../features/ai/completions/openai'
import type { RaycastCompletions } from '../../types/raycast/completions'
import { GroqWebCompletions } from '../../features/ai/completions/groq-web'

export async function Completions(request: FastifyRequest, reply: FastifyReply) {
  const body = request.body as RaycastCompletions
  const config = getConfig('ai')
  const provider = (body.provider || config?.default?.toLowerCase()) as keyof typeof config
  if (!(config && provider && config[provider] && !(config[provider] as any).disabled)) {
    consola.warn(`Completions not supported for this model. Please check your config. provider: ${provider}`)
    reply.status(400).send({
      error: 'Completions not supported for this model. Please check your config.',
    })
  }
  let completionsHandler: Function | undefined
  switch (provider) {
    case 'gemini':
      completionsHandler = GeminiChatCompletion
      break
    case 'openai':
      completionsHandler = OpenAIChatCompletion
      break
    // case 'copilot':
    //   return CopilotChatCompletion(request, reply)
    case 'groq':
      completionsHandler = GroqWebCompletions
      break
    default:
      break
  }
  try {
    return await (completionsHandler?.(request, reply) as Promise<any>)
  }
  catch (err) {
    consola.error(err)
  }
}
