export interface TranslateConfig {
  default?: string
  deeplx?: DeepLXTranslateServiceConfig
  ai?: AITranslateServiceConfig
  libretranslate?: LibreTranslateServiceConfig
}
export interface DeepLXTranslateServiceConfig {
  checkAvailable?: boolean
  proxyEndpoints?: string[]
  accessTokens?: string[]
  concurrency?: number
}
export interface AITranslateServiceConfig {
  default?: string
  model?: string
}
export interface LibreTranslateServiceConfig {
  baseUrl?: string
  apiKey?: string
  type?: 'reserve' | 'api'
}
