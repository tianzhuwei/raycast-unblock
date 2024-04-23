import fs from 'node:fs'
import { resolve } from 'node:path'
import os from 'node:os'
import { Debug } from '../../utils/log.util'
import { getConfig } from '../../utils/env.util'

export function getSyncFolder() {
  const config = getConfig('sync')
  const syncSolution = config?.type
  let syncPath = resolve(os.homedir(), 'raycast_sync')
  if (os.platform() === 'darwin' && syncSolution !== 'local')
    syncPath = resolve(os.homedir(), 'Library/Mobile Documents/com~apple~CloudDocs/RaycastSync')

  return syncPath
}

export function prepareSync() {
  const debug = Debug.create('Sync')
  debug.info('Checking sync folder availability...')
  const syncPath = getSyncFolder()
  if (!fs.existsSync(syncPath)) {
    debug.info('Preparing sync folder...')
    fs.mkdirSync(syncPath)
    debug.success('Sync folder created.')
  }
  debug.success(`Sync folder is ready.`)
}
