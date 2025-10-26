#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const viteBin = resolve(__dirname, '../node_modules/vite/bin/vite.js')

const env = { ...process.env }
if (!env.ROLLUP_SKIP_NODEJS_NATIVE_BUILD) {
  env.ROLLUP_SKIP_NODEJS_NATIVE_BUILD = '1'
}

const args = process.argv.slice(2)

const child = spawn(process.execPath, [viteBin, ...args], {
  stdio: 'inherit',
  env
})

child.on('close', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
  } else {
    process.exit(code ?? 0)
  }
})