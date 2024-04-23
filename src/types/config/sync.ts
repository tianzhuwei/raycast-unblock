export enum SyncType {
  LOCAL = 'local',
  ICLOUD = 'icloud',
}

export interface SyncConfig {
  type?: SyncType
}
