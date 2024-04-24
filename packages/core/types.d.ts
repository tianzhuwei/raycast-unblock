declare global {
  namespace NodeJS {
    interface ProcessEnv {
      users: string
      config: string
      configPath: string
    }
  }
}

export { }
