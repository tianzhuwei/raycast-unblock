import process from 'node:process'
import fs from 'node:fs'
import { prepareSync } from './features/sync/pre'
import { launch } from './launch'
import { injectEnv, watchConfig } from './utils/env.util'
import { DATA, PACKAGE_JSON, TMP } from './constants'
import { prepareShortcutRunner } from './utils/shortcuts.util'
import { prepareCache, registCache } from './utils/cache.util'
import { Debug } from './utils/log.util'

injectEnv()
watchConfig()

process.title = PACKAGE_JSON.name

function prepareTmp() {
  const debug = Debug.create('Tmp')
  debug.info('Checking tmp folder...')
  const tmp = TMP
  if (!fs.existsSync(tmp)) {
    debug.info('Preparing tmp folder...')
    fs.mkdirSync(tmp)
    debug.success('tmp folder created.')
  }
  debug.success('tmp prepared.')
}

function prepareData() {
  const debug = Debug.create('Data')
  debug.info('Checking Data folder...')
  if (!fs.existsSync(DATA)) {
    debug.info('Preparing Data folder...')
    fs.mkdirSync(DATA)
    debug.success('Data folder created.')
  }
  debug.success('Data prepared.')
}

launch()

Promise.all([
  prepareTmp(),
  prepareData(),
  prepareSync(),
]).then(() => {
  Debug.success('Root Preparation is done.')
})

Promise.all([
  prepareShortcutRunner(),
  prepareCache(),
]).then(() => {
  Debug.success('Utils Preparation is done.')
})

Promise.all([
  registCache('groq'),
  registCache('cohere'),
]).then(() => {
  Debug.success('Cache Registration is done.')
})
