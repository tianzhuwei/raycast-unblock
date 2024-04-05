import type { IAvailableFunctions } from '../../../types/internal/i-available-functions'
import { SerpConfig } from './plugins/serp'
import { WebSearchConfig } from './plugins/web-search'

export const AvailableFunctions: IAvailableFunctions = {
  serp: SerpConfig,
  web_search: WebSearchConfig,
}
