import type { ChatCompletionTool } from 'openai/resources/index.mjs'
import type { IAvailableFunction } from '@ru/shared'
import { getConfig } from '../../../utils/env.util'
import { AvailableFunctions } from './functions'

export function validateFunctionCall(f: IAvailableFunction) {
  const pluginConfig = getConfig('ai')?.functions?.plugins || {}
  if (!Object.values(pluginConfig)?.includes(f.id))
    return false
  let isValidate = false
  if (f.requiredEnv) {
    for (const env of f.requiredEnv) {
      const config = getConfig(env as any)
      if (!config) {
        isValidate = false
        break
      }
      else {
        isValidate = true
      }
    }
  }
  else {
    isValidate = true
  }
  return isValidate
}

export function getFunctionCallTools() {
  const availableFunctions = AvailableFunctions
  const validateFunctions: IAvailableFunction[] = []
  for (const key in availableFunctions) {
    if (validateFunctionCall(availableFunctions[key]))
      validateFunctions.push(availableFunctions[key])
  }
  return validateFunctions
}

export function getFunctionCallToolsConfig(): Array<ChatCompletionTool> {
  const availableFunctions = getFunctionCallTools()
  const tools: Array<ChatCompletionTool> = []
  for (const f of availableFunctions) {
    tools.push({
      type: 'function',
      function: {
        name: f.id,
        description: f.description,
        parameters: f.paramters,
      },
    })
  }
  return tools
}
