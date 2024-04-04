import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { Debug } from '../utils/log.util'

export function TrashRoute(fastify: FastifyInstance, opts: Record<any, any>, done: Function) {
  fastify.get('/cable', async (_request: FastifyRequest, reply: FastifyReply) => {
    Debug.info('[GET] /cable --> Backend Request')
    Debug.info('[GET] /cable <-- null <-- Backend Response')

    return reply.send()
  })

  done()
}
