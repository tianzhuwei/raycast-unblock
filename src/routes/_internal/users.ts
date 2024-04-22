import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { Debug } from '../../utils/log.util'
import { getStore } from '../../utils/store.util'
import type { User } from '../../types'

export function InternalUsersRoute(fastify: FastifyInstance, opts: Record<any, any>, done: Function) {
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    Debug.info('[GET] /users --> Internal API')
    const store = getStore<User[]>('users') || []
    const users = store.map((u) => {
      const { token: _, ...user } = u
      return user // Omit the token
    })
    return reply.send({ users })
  })

  done()
}
