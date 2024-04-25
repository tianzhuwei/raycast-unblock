import type { AIGenerateContent } from '@ru/shared'
import { generateGroqWebRequestHeader } from '../../../services/groq-web'
import { GROQ_API_COMPLETIONS } from '../../../services/groq-web/constants'
import { groqClient } from '../../../utils'
import { getConfig } from '../../../utils/env.util'

export async function GroqWebGenerateContent(prompt: {
  role: string
  content: string
}[], model?: string): Promise<AIGenerateContent> {
  const aiConfig = getConfig('ai')
  const config = getConfig('ai')?.groq

  const messages = []
  for (const m of prompt) {
    messages.push({
      role: m.role,
      content: m.content,
    })
  }

  const headers = await generateGroqWebRequestHeader()
  const temperature = config?.temperature || aiConfig?.temperature || 0.5
  const requestBody = {
    messages,
    model: model || config?.default || 'llama3-70b-8192',
    temperature,
    top_p: 1,
    n: 1,
    stream: false,
    max_tokens: config?.maxTokens || aiConfig?.maxTokens,
  }

  const result = await groqClient(GROQ_API_COMPLETIONS, {
    method: 'POST',
    headers,
    body: requestBody,
  })

  const text = result.choices[0].message.content!
  const split = text.split('\n')
  const detectedSourceLanguage = split[0]
  const translatedText = split[1]

  return {
    content: translatedText,
    detectedSourceLanguage,
  }
}
