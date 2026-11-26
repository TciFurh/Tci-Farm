/**
 * 安装后自动为 engine 安装协议依赖（express/protobufjs/ws 等）。
 * 失败不阻断安装，README 里有手动命令。
 */
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __dir = path.dirname(fileURLToPath(import.meta.url))
const engineDir = path.resolve(__dir, '..', 'engine')
const pkg = path.join(engineDir, 'package.json')

if (!fs.existsSync(pkg)) {
  console.log('[tci-farm] 未找到 engine/package.json，跳过引擎依赖安装')
  process.exit(0)
}

try {
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
  console.log('[tci-farm] 安装引擎依赖…')
  execFileSync(npm, ['install', '--no-audit', '--no-fund'], { cwd: engineDir, stdio: 'inherit' })
  console.log('[tci-farm] 引擎依赖安装完成')
} catch (err) {
  console.warn('[tci-farm] 引擎依赖安装失败，请手动执行：cd engine && npm install')
  console.warn('[tci-farm] 原因：' + (err?.message || err))
}
