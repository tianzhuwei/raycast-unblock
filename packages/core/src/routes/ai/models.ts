import type { AIConfig, AIModelConfig, OpenAIServiceConfig, RaycastAIModel } from '@ru/shared'
import { getConfig } from '../../utils/env.util'
import { toSnakeCase } from '../../utils/others.util'
import { COHERE_SERVICE_PROVIDERS, GEMINI_SERVICE_PROVIDERS, GROQ_SERVICE_PROVIDERS, OPENAI_SERVICE_PROVIDERS, RAYCAST_DEFAULT_GROQ_MODELS, RAYCAST_DEFAULT_MODELS, RAYCAST_GEMINI_PRO_ONLY_MODELS } from './constants'

function generateRaycastAIServiceProviders() {
  const config = getConfig('ai')
  const default_models = []
  if (config?.openai && !config?.openai?.disable) {
    default_models.push([
      ...OPENAI_SERVICE_PROVIDERS,
      ...Object.entries(getConfig('ai')?.openai?.models || {}).map(([key, value]) => {
        const capabilities: {
          [key: string]: string | undefined
        } = {}

        for (const [key, val] of Object.entries(value.capabilities || {})) {
          const _key = toSnakeCase(key)
          // capabilities[_key] = val ? 'full' : undefined
          if (val === true)
            capabilities[_key] = 'full'
          else
            continue
        }

        return ({
          id: value.id || key,
          description: value.description || '',
          model: value.model || key,
          name: value.name || key,
          provider: 'openai',
          // Config processing will convert key to providerName, so it needs to be processed here
          provider_name: (value as any).providerName || 'OpenAI',
          provider_brand: 'openai',
          speed: Number(value.speed) || 3,
          intelligence: Number(value.intelligence) || 3,
          capabilities,
          context: Number(value.context) || 16,
          features: ['chat', 'quick_ai', 'commands', 'api', 'emoji_search'],
          suggestions: [],
          in_better_ai_subscription: false,
          requires_better_ai: false,
          // status: value.status || undefined,
          // status
        } as RaycastAIModel)
      }),
    ])
  }
  if (config?.gemini && !config?.gemini?.disable)
    default_models.push(...GEMINI_SERVICE_PROVIDERS)
  if (config?.groq && !config?.groq.disable)
    default_models.push(...GROQ_SERVICE_PROVIDERS)
  if (config?.cohere && !config?.cohere.disable)
    default_models.push(...COHERE_SERVICE_PROVIDERS)
  default_models.forEach((models) => {
    if (!Array.isArray(models))
      models = [models]

    models.forEach((model) => {
      if (!model.availability)
        model.availability = 'public'
      if (!model.status)
        model.status = null
      const abilities: {
        [key: string]: {
          toggleable: boolean
        }
      } = {}
      for (const [key] of Object.entries(model.capabilities || {})) {
        const _key = toSnakeCase(key)
        abilities[_key] = { toggleable: true }
      }
      model.abilities = abilities
    })
  })
  return default_models.flat()
}

type AIServiceConfigWithNoSingleModel = Omit<AIConfig, 'default' | 'temperature' | 'maxTokens' | 'functions' | 'gemini'>

function getDefaultInModels(ai: keyof AIServiceConfigWithNoSingleModel) {
  const aiConfig = (getConfig('ai') as AIServiceConfigWithNoSingleModel)?.[ai]

  if (aiConfig?.disable)
    return RAYCAST_DEFAULT_MODELS

  let default_model = RAYCAST_DEFAULT_MODELS
  let id = aiConfig?.default || RAYCAST_DEFAULT_MODELS.api

  if (aiConfig?.default) {
    if (ai === 'openai') {
      const model = (aiConfig as OpenAIServiceConfig).models?.[aiConfig.default] || {} as AIModelConfig
      if (model)
        id = model.id || aiConfig.default
    }
  }
  else {
    switch (ai) {
      case 'groq':
        id = RAYCAST_DEFAULT_GROQ_MODELS.api
        break
      case 'cohere':
        id = 'command-r-plus'
        break
      default:
        break
    }
  }

  default_model = {
    chat: id,
    quick_ai: id,
    commands: id,
    api: id,
    emoji_search: id,
  }

  return default_model
}

export function AIModels() {
  const config = getConfig('ai')
  let default_models
  switch (config?.default?.toLowerCase()) {
    case 'gemini':
      default_models = RAYCAST_GEMINI_PRO_ONLY_MODELS
      break
    default:
      default_models = getDefaultInModels(config?.default?.toLowerCase() as keyof AIServiceConfigWithNoSingleModel)
      break
  }
  const models = generateRaycastAIServiceProviders()
  return {
    default_models,
    models,
  }
}
