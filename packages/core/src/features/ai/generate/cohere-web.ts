import destr from 'destr'
import type { AIGenerateContent } from '@ru/shared'
import { generateCohereWebChatHeader } from '../../../services/cohere-web'
import { COHERE_API_CHAT, COHERE_API_ENDPOINT } from '../../../services/cohere-web/constants'
import type { CohereWebChatBody, CohereWebChatResponse } from '../../../services/cohere-web/types'
import { cohereClient } from '../../../utils'
import { getConfig } from '../../../utils/env.util'
import { responseToStream } from '../../../utils/response-to-stream.util'

export async function CohereWebGenerateContent(prompt: {
  role: string
  content: string
}[], msg?: string, conversationId?: string): Promise<AIGenerateContent> {
  const aiConfig = getConfig('ai')
  const config = getConfig('ai')?.cohere

  let message = ''
  for (const m of prompt)
    message += `${m.content}\n`

  if (msg)
    message += `${msg}\n`

  const headers = await generateCohereWebChatHeader()
  const temperature = config?.temperature || aiConfig?.temperature || 0.5

  const body = {
    message,
    model: 'command-r-plus',
    temperature,
    citationQuality: 'CITATION_QUALITY_ACCURATE',
    conversationId,
  } as CohereWebChatBody

  const res = await cohereClient.native(`${COHERE_API_ENDPOINT}${COHERE_API_CHAT}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  }).catch((e: any) => {
    throw new Error(`Request error: ${e.message}`)
  })

  if (!res.ok)
    throw new Error(`Request error: ${res.statusText}`)

  const stream = responseToStream(res)

  const reader = stream.getReader()
  let lastValue: any
  while (true) {
    const { done, value } = await reader.read()
    if (done)
      break
    lastValue = value
  }
  const stringData = new TextDecoder().decode(lastValue)
  const data = destr(stringData) as CohereWebChatResponse

  const content = data.result.chatStreamEndEvent?.response.text || ''
  const split = content.split('\n')
  const detectedSourceLanguage = split[0]
  const translatedText = split[1]

  return {
    raw: stringData,
    content: translatedText,
    detectedSourceLanguage,
  }
}
