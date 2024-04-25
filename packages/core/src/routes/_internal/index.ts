import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import type { User } from '@ru/shared'
import { Debug } from '../../utils/log.util'
import { getStore } from '../../utils/store.util'
import { getConfig } from '../../utils/env.util'

export function InternalRoute(fastify: FastifyInstance, opts: Record<any, any>, done: Function) {
  fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
    const { token } = request.headers
    const debug = Debug.create('route:_internal')
    const config = getConfig('general')?.token
    if (config && token !== config) {
      debug.warn('Unauthorized access')
      return reply.code(401).send({ message: 'Unauthorized' })
    }
    else if (!config) {
      debug.warn('Token not found in config')
      return reply.code(401).send({ message: 'Token not found in config' })
    }
    else {
      debug.info('Authorized access')
    }
  })
  fastify.get('/users', async (request: FastifyRequest, reply: FastifyReply) => {
    Debug.info('[GET] /_internal/users --> Internal API')
    const store = getStore<User[]>('users') || []
    const users = store.map((u) => {
      const { token: _, ...user } = u
      return user // Omit the token
    })
    return reply.send({ users })
  })
  fastify.post('/model', async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.send({ message: 'Not implemented' })
  })
  done()
}
