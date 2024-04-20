import type { FalsyValue, Params } from 'fastify-cron'
import { checkGroqModels } from './crons/check-groq-models'
import { checkLatestVersion } from './crons/check-latest-version'

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
]
