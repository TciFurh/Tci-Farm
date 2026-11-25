/**
 * 内置引擎客户端：fork engine/runner.cjs 提供无面板运行时。
 * 插件与引擎通过 IPC 通信；引擎挂了会自动重启（退避）。
 */
import { fork } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dir = path.dirname(fileURLToPath(import.meta.url))

const G = globalThis.__farmLiteEngine || (globalThis.__farmLiteEngine = {
  child: null,
  pending: new Map(),
  seq: 0,
  readyAt: 0,
  restarting: false,
  logs: [],
})

const RUNNER = path.join(__dir, '..', 'engine', 'runner.cjs')

function log(tag, msg) {
  const line = `[${tag}] ${msg}`
  G.logs.push(line)
  if (G.logs.length > 200) G.logs.shift()
  try { console.log('[FarmLite] ' + line) } catch { /* ignore */ }
}

function spawnEngine() {
  if (G.child) return G.child
  log('engine', '启动内置引擎…')
  const child = fork(RUNNER, [], {
    stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
    windowsHide: true,
  })
  G.child = child
  G.readyAt = 0

  child.stdout.on('data', d => {
    const text = String(d).trim()
    if (text) log('engine', text.slice(0, 400))
  })
  child.stderr.on('data', d => {
    const text = String(d).trim()
    if (text) log('engine-err', text.slice(0, 400))
  })

  child.on('message', msg => {
    if (!msg || msg.type !== 'rpc') return
    const p = G.pending.get(msg.id)
    if (!p) return
    G.pending.delete(msg.id)
    if (msg.ok) p.resolve(msg.result)
    else p.reject(new Error(msg.error || '引擎调用失败'))
  })

  child.on('exit', code => {
    G.child = null
    G.readyAt = 0
    for (const [, p] of G.pending) p.reject(new Error('引擎已退出（code ' + code + '），正在重启'))
    G.pending.clear()
    if (!G.restarting) {
      G.restarting = true
      setTimeout(() => { G.restarting = false; try { spawnEngine() } catch (e) { log('engine', '重启失败：' + e.message) } }, 3000)
    }
    log('engine', `引擎退出（code ${code}），3 秒后自动重启`)
  })

  child.on('error', err => log('engine', '引擎进程错误：' + err.message))
  return child
}

/** 底层调用：保证引擎在跑、等它就绪后发 RPC */
export async function call(method, params = {}, timeoutMs = 45000) {
  spawnEngine()
  if (!G.readyAt) {
    const ping = await rawCall('ping', {}, 90000).catch(() => null)
    if (!ping?.ready) throw new Error('内置引擎启动失败：' + (ping?.startError || '请查看 #农场帮助 里的诊断'))
    G.readyAt = Date.now()
  }
  return rawCall(method, params, timeoutMs)
}

function rawCall(method, params, timeoutMs) {
  return new Promise((resolve, reject) => {
    const child = G.child
    if (!child) return reject(new Error('引擎未运行'))
    const id = `${Date.now().toString(36)}${(G.seq++).toString(36)}`
    const timer = setTimeout(() => {
      G.pending.delete(id)
      reject(new Error(`引擎响应超时（${method}）`))
    }, timeoutMs)
    G.pending.set(id, {
      resolve: v => { clearTimeout(timer); resolve(v) },
      reject: e => { clearTimeout(timer); reject(e) },
    })
    try { child.send({ type: 'rpc', id, method, params: params || {} }) }
    catch (e) { clearTimeout(timer); G.pending.delete(id); reject(e) }
  })
}

/** 游戏资源根目录（引擎副本内） */
const RES_ROOT = path.join(__dir, '..', 'engine', 'core', 'src', 'gameConfig')

/** 面板风格路径（/game-config/...）直接映射成本地绝对路径，走 file:// 加载 */
export function img(pathOrUrl) {
  if (!pathOrUrl) return ''
  const s = String(pathOrUrl)
  if (/^(https?|file|data):/i.test(s)) return s
  const rel = s.replace(/^\/game-config\/?/, '').replace(/\\/g, '/')
  const abs = path.join(RES_ROOT, rel).replace(/\\/g, '/')
  // 用户名/安装路径可能含中文或空格，file:// 需要百分号编码
  return 'file:///' + encodeURI(abs)
}

/** 引擎健康检查：掉线/无响应时重启 */
export async function ensureHealthy() {
  try {
    const ping = await rawCall('ping', {}, 15000)
    if (ping?.ready) return true
  } catch { /* 落到重启 */ }
  try {
    if (G.child) { G.child.kill(); G.child = null }
    G.readyAt = 0
    await call('ping')
    return true
  } catch {
    return false
  }
}

export function engineLogs() {
  return G.logs.slice(-20)
}

export function stopEngine() {
  if (G.child) {
    try { G.child.kill() } catch { /* ignore */ }
    G.child = null
    G.readyAt = 0
  }
}
