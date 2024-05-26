import type { FalsyValue, Params } from 'fastify-cron'
import consola from 'consola'
import { checkLatestVersion } from './crons/check-latest-version'
import { cohereWebGetOrCreateDefaultAPIKey, cohereWebLogin } from './services/cohere-web'
import { getConfig } from './utils/env.util'
import { checkDeepLXEndpoints } from './crons/check-deeplx-endpoints'

export const cronJobs: (Params | FalsyValue)[] = [
  {
    cronTime: '0 0 * * *', // 每天0点
    onTick: async () => {
      Promise.all([
        checkLatestVersion(),
      ]).catch((err) => {
        console.error(err)
      })
    },
  },
  {
    cronTime: '0 0 * * *', // 每天0点
    onTick: async () => {
      const config = getConfig('ai')?.cohere
      if (config?.type === 'web') {
        await cohereWebLogin()
        await cohereWebGetOrCreateDefaultAPIKey()
      }
    },
    runOnInit: true,
  },
  {
    cronTime: '0 * * * * *', // 每分钟
    onTick: async () => {
      const config = getConfig('ai')?.cohere
      if (config?.type === 'web')
        await cohereWebGetOrCreateDefaultAPIKey()
    },
  },
  {
    cronTime: '0 0 * * *', // 每天0点
    onTick: async () => {
      Promise.all([
        checkDeepLXEndpoints(),
      ]).catch((err) => {
        consola.error(err)
      })
    },
    runOnInit: true,
  },
]
