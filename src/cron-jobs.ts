import type { FalsyValue, Params } from 'fastify-cron'
import { checkGroqModels } from './crons/check-groq-models'
import { checkLatestVersion } from './crons/check-latest-version'
import { cohereWebGetOrCreateDefaultAPIKey, cohereWebLogin } from './services/cohere-web'

export const cronJobs: (Params | FalsyValue)[] = [
  {
    cronTime: '0 0 * * *', // 每天0点
    onTick: async () => {
      Promise.all([
        checkGroqModels(),
        checkLatestVersion(),
      ])
    },
  },
  {
    cronTime: '0 0 * * *', // 每天0点
    onTick: async () => {
      await cohereWebLogin()
      await cohereWebGetOrCreateDefaultAPIKey()
    },
    runOnInit: true,
  },
  {
    cronTime: '0 * * * * *',
    onTick: async () => {
      await cohereWebGetOrCreateDefaultAPIKey()
    },
  },
]
