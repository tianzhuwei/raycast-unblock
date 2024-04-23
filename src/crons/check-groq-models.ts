import consola from 'consola'
import { GROQ_SERVICE_PROVIDERS } from '../routes/ai/constants'
import { generateGroqWebRequestHeader } from '../services/groq-web'
import { GROQ_API_MODELS } from '../services/groq-web/constants'
import { groqClient } from '../utils'
import { Debug } from '../utils/log.util'
import { getConfig } from '../utils/env.util'

export async function checkGroqModels() {
  const config = getConfig('ai')?.groq?.refreshToken
  if (!config)
    return
  const debug = Debug.create('crons:checkGroqModels')
  debug.info('Checking GROQ models...')
  const headers = await generateGroqWebRequestHeader()
  const result = await groqClient(GROQ_API_MODELS, {
    method: 'GET',
    headers,
  })
  const models = result.data as {
    id: string
    object: 'model'
    created: number
    owned_by: string
    active: boolean
    context_window: number
  }[]
  debug.success('GROQ models are ready. Comparing models...')
  debug.info('GROQ models: ', models.map(m => m.id))
  const builtInModels = GROQ_SERVICE_PROVIDERS.map(provider => provider.id)
  debug.info('Built-in models: ', builtInModels)
  const missingModels = models.filter(m => !builtInModels.includes(m.id)).map(m => m.id)
  if (missingModels.length) {
    consola.error('[Groq Cron] Missing GROQ models: ', missingModels)
    consola.error(`[Groq Cron] Please create an issue: \n https://github.com/wibus-wee/raycast-unblock/issues/new?assignees=wibus-wee&labels=bug&template=bug_report.md&title=Missing+GROQ+models%3A+${missingModels.join('%2C+')}`)
  }
  else {
    debug.success('All GROQ models are available')
  }
}
