import fs from 'node:fs'
import { Debug } from './log.util'

export function readFileSafeSync(path: string): string | undefined {
  try {
    return fs.readFileSync(path, 'utf-8')
  }
  catch (error) {
    Debug.error(error)
    return undefined
  }
}
