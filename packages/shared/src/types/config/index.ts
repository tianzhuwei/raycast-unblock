import type { AIConfig } from './ai'
import type { GeneralConfig } from './general'
import type { SyncConfig } from './sync'
import type { TranslateConfig } from './translate'

export interface Config {
  general?: GeneralConfig
  ai?: AIConfig
  translate?: TranslateConfig
  sync?: SyncConfig
}

export * from './ai'
export * from './general'
export * from './sync'
export * from './translate'
