import process from 'node:process'
import path from 'node:path'
import { readFileSync } from 'node:fs'
import Fastify from 'fastify'
import consola from 'consola'
import { FastifySSEPlugin } from 'fastify-sse-v2'
import fastifyCompress from '@fastify/compress'
import fastifyCron from 'fastify-cron'
import { MeRoute } from './routes/me'
import { httpClient } from './utils'
import { AIRoute } from './routes/ai'
import { TranslationsRoute } from './routes/translations'
import { Debug } from './utils/log.util'
import { getConfig } from './utils/env.util'
import { TrashRoute } from './routes/trash'
import { type SelfSignedCertificate, createSelfSignedCertificate } from './utils/mkcert'
import { cronJobs } from './cron-jobs'
import { InternalRoute } from './routes/_internal'
import { ExtensionsRoute } from './routes/extensions'
import { PACKAGE_JSON } from './constants'

const prefix = '/api/v1'

export async function launch() {
  const config = getConfig('general')

  let certificate: SelfSignedCertificate | undefined
  const enabled = config?.https?.enabled
  const key = config?.https?.key
  const cert = config?.https?.cert
  const ca = config?.https?.ca
  if (enabled) {
    if (key && cert) {
      certificate = {
        key,
        cert,
        rootCA: ca,
      }
    }
    else {
      certificate = await createSelfSignedCertificate(config?.https?.host)
    }
  }
  const https = {
    key: certificate?.key ? readFileSync(path.resolve(certificate?.key), 'utf-8') : undefined,
    cert: certificate?.cert ? readFileSync(path.resolve(certificate?.cert), 'utf-8') : undefined,
    ca: certificate?.rootCA ? readFileSync(path.resolve(certificate?.rootCA), 'utf-8') : undefined,
  }
  const fastify = Fastify({
    logger: config?.logger || false,
    // @ts-expect-error certificate config
    https: certificate ? https : undefined,
  })

  fastify.setErrorHandler((error, request, reply) => {
    reply.status(500).send({
      errors: [
        {
          status: '500',
          title: error.message,
        },
      ],
    })
  })

  fastify.register(FastifySSEPlugin)
  fastify.register(fastifyCron, {
    jobs: cronJobs,
  })

  fastify.register(TrashRoute)
  fastify.register(InternalRoute, { prefix: `_internal` })
  fastify.register(MeRoute, { prefix: `${prefix}/me` })
  fastify.register(AIRoute, { prefix: `${prefix}/ai` })
  fastify.register(TranslationsRoute, { prefix: `${prefix}/translations` })
  fastify.register(ExtensionsRoute, { prefix: `${prefix}/extensions` })

  await fastify.register(fastifyCompress, {
    global: true,
  })

  fastify.get('/', async (_request, _reply) => {
    return {
      name: 'raycast-unblock',
      version: PACKAGE_JSON.version,
      author: PACKAGE_JSON.author,
    }
  })

  fastify.get('/*', async (request, reply) => {
    const subUrl = request.url.substring(0, 30)
    Debug.info(`[GET] ${subUrl} <-- 托底策略 --> Backend Request`)

    const url = new URL(request.url, 'https://backend.raycast.com')

    request.headers = {
      ...request.headers,
      host: 'backend.raycast.com',
    }

    const backendResponse = await httpClient.native(url, {
      headers: request.headers as Record<string, string>,
      method: 'GET',
      redirect: 'manual',
    }).catch((reason) => {
      consola.error(`[GET] ${subUrl} <-- 托底策略 <-x- Backend Response Error`)
      consola.error(reason)
      return reply.send(reason)
    })
    Debug.info(`[GET] ${subUrl} <-- 托底策略 <-- Backend Response`)

    const headers = Object.fromEntries(backendResponse.headers.entries())
    delete headers['content-encoding']

    const bodyBuffer = await backendResponse.arrayBuffer()
    const bodyArray = new Uint8Array(bodyBuffer)

    return reply.status(backendResponse.status).headers(headers).send(bodyArray)
  })

  consola.info(`Raycast Unblock`)
  consola.info(`Version: ${PACKAGE_JSON.version}`)
  consola.info('Server starting...')

  if (!certificate && config?.port === 443)
    consola.warn('You are trying to start the HTTPS protocol without a certificate, which may cause problems')

  fastify.listen({ port: config?.port || 3000, host: config?.host || '0.0.0.0' }, (err, address) => {
    fastify.cron.startAllJobs()
    if (err) {
      consola.error(err)
      process.exit(1)
    }
    consola.success(`Server listening on ${address}.`)
  })
}
