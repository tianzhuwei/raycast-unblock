export interface User {
  id: string
  avatar: {
    url: string
    placeholder: string
  }
  name: string
  username: string
  // avatar_placeholder_color: string
  email: string
  tokens: string[]
}

export * from './config'
export * from './internal'
export * from './raycast'
