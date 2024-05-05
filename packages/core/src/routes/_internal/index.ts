import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import type { User } from '@ru/shared'
import { Debug } from '../../utils/log.util'
import { getStore } from '../../utils/store.util'
import { getConfig } from '../../utils/env.util'
import { getLastSyncTime } from '../../features/sync/impl'

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
  fastify.get('/users', async (_request: FastifyRequest, reply: FastifyReply) => {
    Debug.info('[GET] /_internal/users --> Internal API')
    const store = getStore<User[]>('users') || []
    const users = store.map((user) => {
      const { email } = user
      const lastSync = getLastSyncTime(email)
      return {
        ...user,
        lastSync,
      }
    })
    return reply.send({ users })
  })

  done()
}
