import consola from 'consola'
import { COHERE_SERVICE_PROVIDERS } from '../routes/ai/constants'
import { cohereClient } from '../utils'
import { getConfig } from '../utils/env.util'
import { Debug } from '../utils/log.util'

export async function checkCohereModels() {
  const config = getConfig('ai')?.cohere?.apiKey
  if (!config)
    return

  const debug = Debug.create('crons:checkCohereModels')
  debug.info('Checking Cohere models...')
  const result = await cohereClient<{
    models: {
      name: string
      endpoints: string[]
      finetuned: boolean
      context_length: number
      tokenizer_url: string
      default_endpoints: string[]
    }[]
    next_page_token: string
  }>('https://api.cohere.ai/v1/models', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${config}`,
    },
  })
  const models = result.models.filter((m) => {
    return m.endpoints.includes('chat')
  })
  debug.success('Cohere models are ready. Comparing models...')
  debug.info('Cohere models: ', models.map(m => m.name))
  const builtInModels = COHERE_SERVICE_PROVIDERS.map(provider => provider.id)
  debug.info('Built-in models: ', builtInModels)
  const missingModels = models.filter(m => !builtInModels.includes(m.name)).map(m => m.name)
  if (missingModels.length) {
    consola.error('Missing Cohere models: ', missingModels)
    consola.error(`Please create an issue: \n https://github.com/wibus-wee/raycast-unblock/issues/new?assignees=wibus-wee&labels=bug&template=bug_report.md&title=Missing+Cohere+models%3A+${missingModels.join('%2C+')}`)
  }
  else {
    debug.success('All Cohere models are available')
  }
}
