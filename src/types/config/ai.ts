import type { RaycastAIModel } from '../raycast/models'

export interface AIConfig {
  default?: string
  temperature?: number
  maxTokens?: number
  functions?: AIServiceFunctionsConfig
  openai?: OpenAIServiceConfig
  gemini?: GeminiServiceConfig
  // copilot?: CopilotServiceConfig
  groq?: GroqServiceConfig
}
export interface AIServiceFunctionsConfig {
  plugins?: {
    [key: string]: string
  }
  serp?: {
    apyHubApiKey?: string
    tavilyAiApiKey?: string
  }
}
export interface AIServiceConfig {
  disable?: boolean
  apiKey?: string
  maxTokens?: number
  temperature?: number
}
export interface OpenAIServiceConfig extends AIServiceConfig {
  baseUrl?: string
  models?: AIServiceModelsConfig
  default?: string
  isAzure?: boolean
  azureDeploymentName?: string
}
export interface GeminiServiceConfig extends AIServiceConfig {}

// export interface CopilotServiceConfig extends AIServiceConfig {
//   default: 'gpt-3.5-turbo' | 'gpt-4'
// }

export interface GroqServiceConfig extends Omit<AIServiceConfig, 'apiKey'> {
  refreshToken?: string
  default: string
}

interface AIModelConfig extends Omit<RaycastAIModel, 'capabilities'> {
  capabilities: {
    imageGeneration: boolean
    webSearch: boolean
  }
}

export interface AIServiceModelsConfig {
  [key: string]: AIModelConfig
}
