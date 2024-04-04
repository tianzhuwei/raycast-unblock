export interface User {
  email: string
  token: string
}

export interface LegacyAIConfig {
  // type?: 'openai' | 'gemini' | 'copilot'
  type?: 'openai' | 'gemini'
  key?: string
  endpoint?: string
  max_tokens?: string
  temperature?: string
}
