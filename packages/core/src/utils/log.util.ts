import process from 'node:process'
import { Console } from 'node:console'
import consola from 'consola'
import { getConfig } from './env.util'

declare global {
  interface Console {
    success: (message: any, ...args: any[]) => void
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

export function createLogMethod(target: 'consola' | 'native', level: string, module = '') {
  return (message: any, ...args: any) => DebugConsole(target, level, `${module ? `[${module}]` : ''}`, message, ...args)
}

interface DebugType {
  info: (message: any, ...args: any) => void
  success: (message: any, ...args: any) => void
  warn: (message: any, ...args: any) => void
  error: (message: any, ...args: any) => void
  log: (message: any, ...args: any) => void
}

export const Debug = {
  info: createLogMethod('consola', 'info'),
  success: createLogMethod('consola', 'success'),
  warn: createLogMethod('consola', 'warn'),
  error: createLogMethod('consola', 'error'),
  log: createLogMethod('consola', 'log'),

  native: {
    ...['info', 'success', 'warn', 'error', 'log'].reduce((methods: Record<string, any>, level: string) => {
      methods[level] = createLogMethod('native', level)
      return methods
    }, {}),
  },

  create: (module?: string) => ({
    ...['info', 'success', 'warn', 'error', 'log'].reduce((methods: Record<string, any>, level) => {
      methods[level] = createLogMethod('consola', level, module)
      return methods
    }, {}) as DebugType,
    native: {
      ...['info', 'success', 'warn', 'error', 'log'].reduce((methods: Record<string, any>, level) => {
        methods[level] = createLogMethod('native', level, module)
        return methods
      }, {}) as DebugType,
    },
  }),
}
