import translate from '@iamtraction/google-translate'
import type { FastifyRequest } from 'fastify'
import type { TranslateFrom, TranslateTo } from '@ru/shared'

export async function TranslateWithGoogle(request: FastifyRequest): Promise<TranslateTo> {
  const body = request.body as TranslateFrom

  // Why need this?
  // in @iamtraction/google-translate, Chinese is sperated into two types: zh-cn and zh-tw
  // but in Raycast, the Simplified Chinese is zh and Traditional Chinese is zh-tw
  // So we need to convert zh to zh-cn
  if (body.source === 'zh')
    body.source = 'zh-cn'
  if (body.target === 'zh')
    body.target = 'zh-cn'

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
