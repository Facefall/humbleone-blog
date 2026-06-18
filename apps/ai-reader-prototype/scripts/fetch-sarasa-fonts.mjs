import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, statSync, copyFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { path7za } from '7zip-bin'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '..')
const fontsDir = join(rootDir, 'public', 'fonts')
const targets = ['SarasaMonoSC-Regular.ttf', 'SarasaMonoSC-Bold.ttf']
const localArchive = join(fontsDir, 'SarasaMonoSC-TTF-1.0.39.7z')
const extractDir = join(fontsDir, 'SarasaMonoSC-TTF-1.0.39')

mkdirSync(fontsDir, { recursive: true })

if (targets.every((name) => existsSync(join(fontsDir, name)))) {
  console.log('Sarasa Mono SC fonts already present.')
  process.exit(0)
}

if (!existsSync(localArchive)) {
  throw new Error(
    `Missing ${localArchive}. Download SarasaMonoSC-TTF-1.0.39.7z from https://github.com/be5invis/Sarasa-Gothic/releases`,
  )
}

mkdirSync(extractDir, { recursive: true })
console.log(`Extracting ${localArchive}...`)
execFileSync(path7za, ['x', localArchive, `-o${extractDir}`, '-y'], { stdio: 'inherit' })

function findFiles(dir) {
  const found = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) found.push(...findFiles(fullPath))
    else if (targets.includes(entry.name)) found.push(fullPath)
  }
  return found
}

const matches = findFiles(extractDir)
if (matches.length === 0) {
  throw new Error('Could not find SarasaMonoSC-Regular.ttf or Bold.ttf in extracted archive.')
}

for (const source of matches) {
  const fileName = source.split(/[/\\]/).pop()
  const dest = join(fontsDir, fileName)
  copyFileSync(source, dest)
  console.log(`Copied ${fileName} (${statSync(dest).size} bytes)`)
}
