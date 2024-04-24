export interface GeneralConfig {
  mode?: 'local' | 'remote'
  port?: number
  host?: string
  debug?: boolean
  logger?: boolean
  watch?: boolean
  https?: {
    enabled?: boolean
    key?: string
    cert?: string
    ca?: string
    host?: string
  }
  token?: string
}
