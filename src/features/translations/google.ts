import translate from '@iamtraction/google-translate'
import type { FastifyRequest } from 'fastify'
import type { TranslateFrom, TranslateTo } from '../../types/raycast/translate'

export async function TranslateWithGoogle(request: FastifyRequest): Promise<TranslateTo> {
  const body = request.body as TranslateFrom
  const res = await translate(body.q, {
    from: body.source,
    to: body.target,
  })
  return {
    data: {
      translations: [
        {
          translatedText: res.text,
          detectedSourceLanguage: res.from.language.iso,
        },
      ],
    },
  }
}
