import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { TranslateWithShortcut } from '../../features/translations/shortcuts'
import { TranslateWithAI } from '../../features/translations/ai'
import { Debug } from '../../utils/log.util'
import { TranslateWithDeepLX } from '../../features/translations/deeplx'
import { TranslateWithLibreTranslate } from '../../features/translations/libre-translate'
import { getConfig } from '../../utils/env.util'
import { TranslateWithGoogle } from '../../features/translations/google'

export function TranslationsRoute(fastify: FastifyInstance, opts: Record<any, any>, done: Function) {
  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const config = getConfig('translate')
    Debug.info('[GET] /translations --> Local Handler')
    let handler
    Debug.info(`[GET] /translations --> Local Handler --> ${config?.default || 'deeplx'}`)
    switch (config?.default?.toLowerCase() || 'deeplx') {
      case 'shortcut':
        handler = TranslateWithShortcut
        break
      case 'ai':
        handler = TranslateWithAI
        break
      case 'deeplx':
        handler = TranslateWithDeepLX
        break
      case 'libre_translate':
        handler = TranslateWithLibreTranslate
        break
      case 'google':
        handler = TranslateWithGoogle
        break
      default:
        handler = TranslateWithDeepLX
        break
    }
    const res = await handler(request).catch((e) => {
      Debug.error('[GET] /translations --> Local Handler --> Error', e)
      return e
    })
    Debug.info('[GET] /translations <-- Local Handler')
    return reply.send(res)
  })
  done()
}
