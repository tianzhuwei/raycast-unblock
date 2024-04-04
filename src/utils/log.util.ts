import process from 'node:process'
import { Console } from 'node:console'
import consola from 'consola'
import { getConfig } from './env.util'

declare global {
  interface Console {
    success(message: any, ...args: any[]): void
  }
}

Console.prototype.success = function (message: any, ...args: any[]) {
  this.log('\x1B[32m%s\x1B[0m', message, ...args)
}

function DebugConsole(mode: 'consola' | 'native', type: string, message: any, ...args: any[]) {
  const module = mode === 'native' ? console : consola
  if (process.env.DEBUG || getConfig('general')?.debug) {
    if (typeof message === 'object') {
      const newMessage = JSON.parse(JSON.stringify(message))
      Object.keys(newMessage).forEach((key) => {
        if (key.toLowerCase() === 'apikey')
          newMessage[key] = '[***PROTECTED***]'
        else if (typeof newMessage[key] === 'object')
          newMessage[key] = removeSensitiveAPIKeyMessageHelper(newMessage[key])
      })
      return (module as any)[type](`[DEBUG]`, newMessage, ...args)
    }
    else {
      return (module as any)[type](`[DEBUG]`, message, ...args)
    }
  }
}

function removeSensitiveAPIKeyMessageHelper(obj: any) {
  if (typeof obj === 'object') {
    Object.keys(obj).forEach((key) => {
      if (key.toLowerCase() === 'apikey')
        obj[key] = '[***PROTECTED***]'
      else if (typeof obj[key] === 'object')
        obj[key] = removeSensitiveAPIKeyMessageHelper(obj[key])
    })
  }
  return obj
}

export const Debug = {
  info: (message: any, ...args: any[]) => DebugConsole('consola', 'info', message, ...args),
  success: (message: any, ...args: any[]) => DebugConsole('consola', 'success', message, ...args),
  warn: (message: any, ...args: any[]) => DebugConsole('consola', 'warn', message, ...args),
  error: (message: any, ...args: any[]) => DebugConsole('consola', 'error', message, ...args),
  log: (message: any, ...args: any[]) => DebugConsole('consola', 'log', message, ...args),
  native: {
    info: (message: any, ...args: any[]) => DebugConsole('native', 'info', message, ...args),
    success: (message: any, ...args: any[]) => DebugConsole('native', 'success', message, ...args),
    warn: (message: any, ...args: any[]) => DebugConsole('native', 'warn', message, ...args),
    error: (message: any, ...args: any[]) => DebugConsole('native', 'error', message, ...args),
    log: (message: any, ...args: any[]) => DebugConsole('native', 'log', message, ...args),
  },
}
