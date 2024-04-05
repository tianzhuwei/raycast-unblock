import fs from 'node:fs'
import process from 'node:process'
import consola from 'consola'
import { argv } from 'zx'
import { parse } from 'toml'
import destr from 'destr'
import type { Config } from '../types/config'
import { Debug } from './log.util'
import { getValueFromDotNotation, matchKeyInObject, toCamelCaseInObject, tolowerCaseInObject, transformToString } from './others.util'

/**
 * Check the default OpenAI model configuration.
 *
 * It may be configured to a non-existent model, in this case, it needs to be removed
 */
function checkOpenAIDefaultModelConfig(env: Config) {
  if (env.ai?.openai?.default && !(env.ai.openai.models as any)[env.ai.openai.default]) {
    consola.warn(`The default AI model [${env.ai.openai.default}] is not available (available models: [${Object.keys(env.ai.openai.models || {}).join(', ')}]), it will be removed from the config`)
    // delete env.ai.openai.default
    if (env.ai.openai.default)
      delete env.ai.openai.default
  }
  return env
}

function checkAIDefaultConfig(env: Config) {
  if (env.ai?.default?.toLowerCase() && !(env.ai as any)[env.ai.default?.toLowerCase()]) {
    consola.warn(`The default AI setting [${env.ai.default?.toLowerCase()}] is not available, use the default setting`)
    env.ai.default = 'openai'
  }
  return env
}

function checkTranslateAIDefaultConfig(env: Config) {
  if (env.translate?.ai?.default?.toLowerCase() && !(env.ai as any)[env.translate.ai.default]) {
    consola.warn(`The default AI model [${env.translate.ai.default}] is not available, it will be removed from the config`)
    delete env.translate.ai.default
  }
  return env
}

function checkDefault(env: Config) {
  env = checkOpenAIDefaultModelConfig(env)
  env = checkAIDefaultConfig(env)
  env = checkTranslateAIDefaultConfig(env)
  return env
}

/**
 * Injects environment variables from a configuration file.
 *
 * If the deprecated flag [--env] is used or if the environment variables 'ENV' or 'env' are set,
 * a warning message is logged.
 * The configuration file is specified using the [--config] flag or defaults to 'config.toml'.
 * The configuration file is parsed and transformed into a JSON object.
 * The JSON object is converted to lowercase and camel case.
 * Default values are checked and applied.
 * The resulting environment variables are stored in the 'config' property of the process.env object.
 * If the 'legacy' property exists in the configuration object, deprecated keys are logged as warnings
 * and their corresponding values are stored as environment variables.
 * A warning message is logged to encourage the use of the new config format.
 */
export function injectEnv() {
  if (matchKeyInObject(argv, 'env') || process.env.ENV || process.env.env)
    consola.warn('You are using deprecated flag [--env]. It can\'t be used in this version anymore. Please use the new config format.')

  const config = matchKeyInObject(argv, 'config') || 'config.toml'
  if (fs.existsSync(config)) {
    let env = parse(fs.readFileSync(config, 'utf-8')) as Config
    env = tolowerCaseInObject(env)
    env = toCamelCaseInObject(env)
    env = checkDefault(env)
    process.env.config = JSON.stringify(env)
    Debug.native.log(env)
    if (env.legacy) {
      for (const key in env.legacy) {
        consola.warn(`[DEPRECATED] You are using deprecated config key [${key.toUpperCase()}]. It can't be used in this version anymore. Please use the new config format.`)
        process.env[key.toUpperCase()] = transformToString((env.legacy as any)[key])
      }
      consola.warn('Please use the new config format. Check the documentation for more information: https://github.com/wibus-wee/raycast-unblock#readme')
    }
  }
  else if (matchKeyInObject(argv, 'config')) { // Only exit if the flag [--config] is used
    consola.error(`The configuration file [${config}] doesn't exist.`)
    process.exit(1)
  }
}

export function watchConfig() {
  const config = matchKeyInObject(argv, 'config') || 'config.toml'
  if (fs.existsSync(config)) {
    consola.info('Watching the configuration file...')
    fs.watchFile(config, () => {
      injectEnv()
      consola.info('The configuration file has been changed. Updating the environment variables...')
      consola.info(`💡 In some cases, you need to manually restart to apply your changes.`)
    })
  }
}

export function getConfig<T extends keyof Config>(key?: T, inKey?: string): Config[T] {
  const env = process.env.config
  if (env) {
    const config = destr<Config>(env)
    if (key) {
      // Debug.info(`[Config] Get config key [${key}]`)
      if (key.includes('.')) {
        Debug.info(`[Config] Get config key [${key}] with dot notation`)
        return getValueFromDotNotation(config, key)
      }
      if (inKey) {
        if (inKey.includes('.')) {
          Debug.info(`[Config] Get config key [${key}] with dot notation`)
          return getValueFromDotNotation(config[key], inKey)
        }
        else {
          Debug.info(`[Config] Get config key [${key}] with inKey [${inKey}]`)
          const _c = config as any
          if (_c[inKey] && _c[inKey][key])
            return _c[inKey][key]
          else
            return {}
        }
      }
      return config[key]
    }
    return config as Config[T]
  }
  return {} as Config[T]
}
