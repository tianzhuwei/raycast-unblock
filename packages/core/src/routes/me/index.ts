import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import consola from 'consola'
import type { User } from '@ru/shared'
import { getBackendResponse } from '../../utils'
import { getStore, setStore } from '../../utils/store.util'
import { Debug } from '../../utils/log.util'
import { TrialStatus } from './trialStatus'
import { GetSync, PutSync } from './sync'

export async function Me(request: FastifyRequest) {
  return await getBackendResponse('/me', request.headers, 'GET')
    .then((response) => {
      Debug.info('[GET] /me --> Backend Response --> Modify Response')
      return {
        ...response,
        has_active_subscription: true,
        has_pro_features: true,
        has_better_ai: true,
        eligible_for_pro_features: true,
        eligible_for_ai: true,
        eligible_for_gpt4: true,
        eligible_for_ai_citations: true,
        eligible_for_developer_hub: true,
        eligible_for_application_settings: true,
        eligible_for_ai_beta_features: true,
        eligible_for_cloud_sync: true,
        publishing_bot: true,
        can_upgrade_to_pro: false,
        admin: true,
      }
    })
}

export function MeRoute(fastify: FastifyInstance, opts: Record<any, any>, done: Function) {
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    Debug.info('[GET] /me --> Backend Request')
    const backendResponse = await Me(request).catch((reason) => {
      consola.error('[GET] /me <-x- Backend Response Error')
      consola.error(reason)
      return reply.send(reason)
    })
    Debug.info('[GET] /me <-- Backend Response')
    const store = getStore<User[]>('users') || []
    const user = store.find(u => u.email === backendResponse.email) || null
    if (!user)
      Debug.success(`<${backendResponse.email}> is logged in.`)
    // Multiple tokens can be stored for the same user
    if (!user?.tokens.includes(request.headers.authorization || '')) {
      Debug.success(`New device detected for <${backendResponse.email}>`)
      const store = {
        id: backendResponse.id,
        avatar: {
          url: backendResponse.avatar,
          placeholder: backendResponse.avatar_placeholder_color,
        },
        name: backendResponse.name,
        username: backendResponse.username,
        email: backendResponse.email,
        tokens: [request.headers.authorization, ...user?.tokens || []],
      } as User
      const originalStore = getStore<User[]>('users') || []
      setStore('users', [store, ...originalStore.filter(u => u.email !== backendResponse.email)])
    }

    return reply.send(backendResponse)
  })

  fastify.get('/trial_status', async (request: FastifyRequest, reply: FastifyReply) => {
    Debug.info('[GET] /me/trial_status --> Backend Request')
    const backendResponse = await TrialStatus(request).catch((reason) => {
      consola.error('[GET] /me/trial_status <-x- Backend Response Error')
      consola.error(reason)
      return reply.send(reason)
    })
    Debug.info('[GET] /me/trial_status <-- Backend Response')
    return reply.send(backendResponse)
  })

  fastify.get('/sync', async (request: FastifyRequest, reply: FastifyReply) => {
    Debug.info('[GET] /me/sync --> Pro Feature Impl')
    const backendResponse = await GetSync(request).catch((reason) => {
      consola.error('[GET] /me/sync <-- Pro Feature Impl Error')
      consola.error(reason)
      return reply.send(reason)
    })
    Debug.info('[GET] /me/sync <-- Pro Feature Impl Response')
    return reply.send(backendResponse)
  })

  fastify.put('/sync', async (request: FastifyRequest, reply: FastifyReply) => {
    Debug.info('[PUT] /me/sync --> Pro Feature Impl')
    const backendResponse = await PutSync(request).catch((reason) => {
      consola.error('[PUT] /me/sync <-- Pro Feature Impl Error')
      consola.error(reason)
      return reply.send(reason)
    })
    Debug.info('[PUT] /me/sync <-- Pro Feature Impl Response')
    return reply.send(backendResponse)
  })

  done()
}
