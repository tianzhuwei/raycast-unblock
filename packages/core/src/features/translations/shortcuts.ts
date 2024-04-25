import type { FastifyRequest } from 'fastify'
import type { TranslateFrom, TranslateShortcutBody, TranslateTo } from '@ru/shared'
import { TRANSLATE_SHORTCUT } from '../../constants'
import { runShortcut } from '../../utils/shortcuts.util'
import { TRANSLATE_DICT } from './dict'

export async function TranslateWithShortcut(request: FastifyRequest): Promise<TranslateTo> {
  const body = request.body as TranslateFrom
  const res = await runShortcut<TranslateShortcutBody>(TRANSLATE_SHORTCUT, {
    source: TRANSLATE_DICT[body.source as keyof typeof TRANSLATE_DICT],
    target: TRANSLATE_DICT[body.target as keyof typeof TRANSLATE_DICT],
    q: body.q,
  })
  return {
    data: {
      translations: [
        {
          translatedText: res,
        },
      ],
    },
  }
}
