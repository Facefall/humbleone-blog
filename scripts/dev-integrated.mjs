import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const repoRoot = fileURLToPath(new URL('..', import.meta.url))
const blogPort = readPort('BLOG_PORT', '5173')
const readerPort = readPort('READER_PORT', '3000')
const readerTarget = process.env.READER_TARGET ?? `http://localhost:${readerPort}`
const isWindows = process.platform === 'win32'
const children = new Map()
let shuttingDown = false

function readPort(name, fallback) {
  const value = process.env[name] ?? fallback

  if (!/^\d+$/.test(value)) {
    throw new Error(`${name} must be a numeric port.`)
  }

  return value
}

function run(name, command, env = {}) {
  const child = spawn(isWindows ? process.env.ComSpec ?? 'cmd.exe' : 'sh', isWindows ? ['/d', '/s', '/c', command] : ['-lc', command], {
    cwd: repoRoot,
    env: {
      ...process.env,
      ...env,
    },
    stdio: 'inherit',
  })

  children.set(name, child)

  child.on('exit', (code, signal) => {
    children.delete(name)

    if (shuttingDown) {
      return
    }

    const status = signal ?? code ?? 0
    console.error(`[dev] ${name} exited (${status}). Stopping integrated dev server.`)
    shutdown()
    process.exit(typeof code === 'number' ? code : 1)
  })

  return child
}

function shutdown(signal = 'SIGTERM') {
  shuttingDown = true

  for (const child of children.values()) {
    if (!child.killed) {
      child.kill(signal)
    }
  }
}

process.on('SIGINT', () => {
  shutdown('SIGINT')
})

process.on('SIGTERM', () => {
  shutdown('SIGTERM')
})

if (await isReachable(readerTarget)) {
  console.log(`[dev] Reusing existing reader at ${readerTarget}`)
} else {
  console.log(`[dev] Starting reader on ${readerTarget}`)
  run('reader', `pnpm --dir apps/ai-reader-prototype exec next dev -p ${readerPort}`, {
    NEXT_TELEMETRY_DISABLED: '1',
    PORT: readerPort,
  })
}

setTimeout(() => {
  console.log(`[dev] Starting blog on http://localhost:${blogPort}/humbleone-blog/`)
  console.log(`[dev] Reader will be available at http://localhost:${blogPort}/humbleone-blog/reader/`)
  run('blog', `pnpm exec vitepress dev --host 0.0.0.0 --port ${blogPort}`, {
    VITE_READER_INTEGRATED: 'true',
    VITE_READER_TARGET: readerTarget,
  })
}, 1200)

async function isReachable(url) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 1500)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
    })

    return response.status < 500
  } catch {
    return false
  } finally {
    clearTimeout(timeout)
  }
}
