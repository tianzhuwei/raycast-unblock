/**
 * reference: https://github.com/vercel/next.js/blob/canary/packages/next/src/lib/mkcert.ts
 */
import process from 'node:process'
import fs from 'node:fs'
import path from 'node:path'
import { WritableStream } from 'node:stream/web'
import { execSync } from 'node:child_process'
import consola from 'consola'
import { getCacheDirectory } from './get-cache-directory'
import { Debug } from './log.util'

const MKCERT_VERSION = 'v1.4.4'

export interface SelfSignedCertificate {
  key: string
  cert: string
  rootCA?: string
}

function getBinaryName() {
  const platform = process.platform
  const arch = process.arch === 'x64' ? 'amd64' : process.arch

  if (platform === 'win32')
    return `mkcert-${MKCERT_VERSION}-windows-${arch}.exe`

  if (platform === 'darwin')
    return `mkcert-${MKCERT_VERSION}-darwin-${arch}`

  if (platform === 'linux')
    return `mkcert-${MKCERT_VERSION}-linux-${arch}`

  throw new Error(`Unsupported platform: ${platform}`)
}

async function downloadBinary() {
  const debug = Debug.create('Certificate')
  try {
    const binaryName = getBinaryName()
    const cacheDirectory = getCacheDirectory('mkcert')
    const binaryPath = path.join(cacheDirectory, binaryName)

    if (fs.existsSync(binaryPath))
      return binaryPath

    consola.info(``)
    const downloadUrl = `https://github.com/FiloSottile/mkcert/releases/download/${MKCERT_VERSION}/${binaryName}`

    await fs.promises.mkdir(cacheDirectory, { recursive: true })

    debug.info(`Downloading mkcert package...`)

    const response = await fetch(downloadUrl)

    if (!response.ok || !response.body)
      throw new Error(`[Certificate] request failed with status ${response.status}`)

    debug.info(`Download response was successful, writing to disk`)

    const binaryWriteStream = fs.createWriteStream(binaryPath)

    await response.body.pipeTo(
      new WritableStream({
        write(chunk) {
          return new Promise((resolve, reject) => {
            binaryWriteStream.write(chunk, (error) => {
              if (error) {
                reject(error)
                return
              }

              resolve()
            })
          })
        },
        close() {
          return new Promise((resolve, reject) => {
            binaryWriteStream.close((error) => {
              if (error) {
                reject(error)
                return
              }

              resolve()
            })
          })
        },
      }),
    )

    await fs.promises.chmod(binaryPath, 0o755)

    return binaryPath
  }
  catch (err) {
    consola.error('[Certificate] Error downloading mkcert:', err)
  }
}

export async function createSelfSignedCertificate(
  host?: string,
  certDir: string = 'certificates',
): Promise<SelfSignedCertificate | undefined> {
  try {
    const binaryPath = await downloadBinary()
    if (!binaryPath)
      throw new Error('missing mkcert binary')

    const resolvedCertDir = path.resolve(process.cwd(), `./${certDir}`)

    await fs.promises.mkdir(resolvedCertDir, {
      recursive: true,
    })

    const keyPath = path.resolve(resolvedCertDir, 'localhost-key.pem')
    const certPath = path.resolve(resolvedCertDir, 'localhost.pem')

    Debug.info(
      '[Certificate] Attempting to generate self signed certificate. This may prompt for your password',
    )

    const defaultHosts = ['localhost', '127.0.0.1', '::1', 'backend.raycast.com']

    if (host)
      consola.info(`[Certificate] You specified the host parameter: ${host}`)

    const hosts
      = host && !defaultHosts.includes(host)
        ? [...defaultHosts, host]
        : defaultHosts

    execSync(
      `"${binaryPath}" -install -key-file "${keyPath}" -cert-file "${certPath}" ${hosts.join(
        ' ',
      )}`,
      { stdio: 'ignore' },
    )

    const caLocation = execSync(`"${binaryPath}" -CAROOT`).toString().trim()

    if (!fs.existsSync(keyPath) || !fs.existsSync(certPath))
      throw new Error('Certificate files not found')

    Debug.info(`[Certificate] CA Root certificate created in ${caLocation}`)
    consola.info(`[Certificate] Certificates created in ${resolvedCertDir}`)
    consola.info(`[NOTICE] [Certificate] If you need to use https access on other hosts. Please see the support documentation.`)
    return {
      key: keyPath,
      cert: certPath,
      rootCA: `${caLocation}/rootCA.pem`,
    }
  }
  catch (err) {
    consola.error(
      '[Certificate] Failed to generate self-signed certificate. Falling back to http.',
      err,
    )
  }
}
