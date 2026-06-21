import { existsSync } from 'node:fs'
import path from 'node:path'
import { config } from 'dotenv'

let loaded = false

export function loadReaderEnv() {
  if (loaded) {
    return
  }

  loaded = true

  const candidates = [
    path.join(process.cwd(), '.env'),
    path.join(process.cwd(), 'apps/ai-reader-prototype/.env'),
  ]

  for (const envPath of candidates) {
    if (!existsSync(envPath)) {
      continue
    }

    config({ path: envPath, quiet: true })
    break
  }
}
