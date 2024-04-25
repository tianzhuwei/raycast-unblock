import type { FastifyRequest } from 'fastify'
import type { TranslateFrom, TranslateTo } from '@ru/shared'
import { GeminiGenerateContent } from '../ai/generate/gemini'
import { getConfig } from '../../utils/env.util'
import { OpenaiGenerateContent } from '../ai/generate/openai'
import { GroqWebGenerateContent } from '../ai/generate/groq-web'
import { CohereWebGenerateContent } from '../ai/generate/cohere-web'
import { generateTranslationsPrompts } from './prompts'

function getDefaultTranslateAI() {
  const aiConfig = getConfig('ai')
  const config = getConfig('translate')
  const configDefault = config?.ai?.default?.toLowerCase() // the default setting in the config
  // We should check if the default setting model is available in the AI config
  if (!configDefault)
    return 'openai' // default to 'openai'
  if ((aiConfig as any)?.[configDefault])
    return configDefault
  return 'openai' // default to 'openai'
}

export async function TranslateWithAI(request: FastifyRequest): Promise<TranslateTo> {
  const body = request.body as TranslateFrom
  const prompts = generateTranslationsPrompts(body.target, body.q, getDefaultTranslateAI())
  let content
  switch (getDefaultTranslateAI()) {
    case 'gemini':
      content = await GeminiGenerateContent(prompts)
      break
    case 'groq': {
      const model = getConfig('translate')?.ai?.model
      content = await GroqWebGenerateContent(prompts, model)
      break
    }
    case 'cohere': {
      content = await CohereWebGenerateContent(prompts)
      break
    }
    case 'openai':
    default: {
      const model = getConfig('translate')?.ai?.model
      content = await OpenaiGenerateContent(prompts, model)
      break
    }
  }

  const res = {
    data: {
      translations: [
        {
          translatedText: content.content,
        },
      ],
    },
  } as TranslateTo

  if (content.detectedSourceLanguage)
    res.data.translations[0].detectedSourceLanguage = content.detectedSourceLanguage

  return res
}
