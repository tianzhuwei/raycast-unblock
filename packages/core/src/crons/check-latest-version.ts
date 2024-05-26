import consola from 'consola'
import destr from 'destr'
import { httpClient } from '../utils'
import { Debug } from '../utils/log.util'
import { PACKAGE_JSON } from '../constants'

export function checkLatestVersion() {
  const debug = Debug.create('Version Cron')
  debug.info('Checking the latest version...')
  const currentVersion = PACKAGE_JSON.version
  const url = 'https://raw.githubusercontent.com/wibus-wee/raycast-unblock/main/package.json'
  httpClient(url, {
    method: 'GET',
  }).then((res) => {
    res = destr(res)
    const latestVersion = res.version
    if (latestVersion !== currentVersion) {
      consola.info(`[Raycast Unblock] New version available: ${latestVersion}`)
      consola.info(`[Raycast Unblock] Please update your Raycast Unblock to the latest version:\nhttps://github.com/wibus-wee/raycast-unblock/releases/tag/v${latestVersion}`)
    }
    else {
      debug.success('Raycast Unblock is up to date')
    }
  }).catch((err) => {
    consola.error(`[Raycast Unblock] Failed to check the latest version: ${err}`)
  })
}
