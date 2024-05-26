import fs from 'node:fs'
import process from 'node:process'
import consola from 'consola'
import { argv } from 'zx'
import TOML from '@iarna/toml'
import destr from 'destr'
import type { Config } from '@ru/shared'
import { Debug } from './log.util'
import { getValueFromDotNotation, matchKeyInObject, toCamelCaseInObject, tolowerCaseInObject } from './others.util'

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

function restoreArray(value: { [key: string]: any }) {
  // In TOML parser, an array is parsed as an object: { 0: 'value1', 1: 'value2' }
  // This function restores the array
  if (Array.isArray(value))
    return value

  if (typeof value === 'object') {
    const keys = Object.keys(value)
    if (keys.every(k => !Number.isNaN(Number.parseInt(k)))) // Check if the object is an array
      return keys.map(k => value[k])

    for (const key in value) // Recursion
      value[key] = restoreArray(value[key])

    return value
  }

  return value
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
    let env = TOML.parse(fs.readFileSync(config, 'utf-8')) as Config
    env = tolowerCaseInObject(env)
    env = toCamelCaseInObject(env)
    env = restoreArray(env) as Config
    env = checkDefault(env)
    process.env.config = JSON.stringify(env)
    process.env.configPath = config
    Debug.native.log(env)
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

export function getConfig(key?: undefined, inKey?: undefined): Config
export function getConfig<T extends keyof Config>(key: T, inKey?: string): Config[T]
export function getConfig<T extends keyof Config>(key: T, inKey?: string): Config[T] {
  const env = process.env.config
  if (env) {
    const debug = Debug.create('Config')

    const config = destr<Config>(env)
    if (key) {
      // debug.info(`Get config key [${key}]`)
      if (key.includes('.')) {
        debug.info(`Get config key [${key}] with dot notation`)
        return getValueFromDotNotation(config, key)
      }
      if (inKey) {
        if (inKey.includes('.')) {
          debug.info(`Get config key [${key}] with dot notation`)
          return getValueFromDotNotation(config[key], inKey)
        }
        else {
          debug.info(`Get config key [${key}] with inKey [${inKey}]`)
          const _c = config as any
          if (_c[inKey] && _c[inKey][key])
            return _c[inKey][key]
          else
            return {}
        }
      }
      return config[key]
    }
    return config as Config
  }
  return {} as Config
}

export function writeConfig(config: Config) {
  const configPath = process.env.configPath
  if (configPath) {
    // console.log(TOML.stringify(JSON.parse(JSON.stringify(config))))
    const _ = TOML.stringify(JSON.parse(JSON.stringify(config)))

    // fs.writeFileSync(configPath, )
    consola.info('The configuration file has been updated.')
  }
}
