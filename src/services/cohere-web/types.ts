export interface CohereWebChatBody {
  message: string
  model: string
  temperature: number
  conversationId?: string
  citationQuality: string
}

export interface CohereWebChatResponse {
  result: {
    eventType: string
    isFinished: boolean
    textGenerationStreamEvent?: {
      text: string
    }
    chatStreamEndEvent?: {
      response: {
        responseId: string
        conversationId: string
        generationId: string
        text: string
        meta: {
          apiVersion: {
            version: string
          }
          billedUnits: {
            inputTokens: number
            outputTokens: number
          }
          tokens: {
            inputTokens: number
            outputTokens: number
          }
        }
      }
      finishReason: string
    }
  }
}

export type CohereWebGetOrCreateDefaultAPIKeyBody = Record<string, never>

export interface CohereWebGetOrCreateDefaultAPIKeyResponse {
  rawKey: string
}

export interface CohereWebAuthV2Body {
  email: string
  password: string
}

export interface CohereWebAuthV2Response {
  bearerTokens: {
    accessToken: string
    refreshToken: string
    userID: string
  }
}

export type CohereWebSessionBody = Record<string, never>

export interface CohereWebSessionResponse {
  user: {
    id: string
    email: string
    name: string
    role: string
    created_at: string
    updated_at: string
    disabled: boolean
    has_google_auth: boolean
    has_github_auth: boolean
    has_email_auth: boolean
    onboarded: boolean
    organization: {
      id: string
      name: string
      created_at: string
      updated_at: string
      disabled: boolean
      payment_id: string | null
      payment_type: string
      balance: number
      balance_limit: number
      balance_limit_enabled: boolean
      accessType: string
      can_create_production_keys: boolean
      accepted_safety_and_legal_terms: boolean
      has_payment_on_file: boolean
      is_cutoff: boolean
      cutoff_reason: string
      future_cutoff_time: string
    }
  }
}

export interface CohereWebCacheConversation {
  conversationId: string
  chat: {
    role: string
    content: string
  }[]
}

export type CohereWebCacheConversations = CohereWebCacheConversation[]
