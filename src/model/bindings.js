/**
 * 用户 ↔ 农场账号绑定：一个 QQ/微信用户可以绑定多个农场账号。
 * 存 data/bindings.json；账号被删时自动清理。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dir = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dir, '..', '..')
const DATA_DIR = process.env.TCI_FARM_DATA || path.join(ROOT, 'data')
const FILE = path.join(DATA_DIR, 'bindings.json')

function read() {
  try {
    const j = JSON.parse(fs.readFileSync(FILE, 'utf8'))
    return j && typeof j === 'object' && j.users ? j : { users: {} }
  } catch {
    return { users: {} }
  }
}

function write(data) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2))
}

const key = qq => String(qq || '').trim()

export function listUsers() {
  return read().users
}

export function getBindings(qq) {
  const u = read().users[key(qq)]
  return { accounts: Array.isArray(u?.accounts) ? u.accounts.map(String) : [], defaultId: String(u?.default || '') }
}

export function bind(qq, accountId) {
  const data = read()
  const k = key(qq)
  if (!k) throw new Error('无法识别用户')
  const u = data.users[k] || (data.users[k] = { accounts: [], default: '' })
  const id = String(accountId)
  if (!u.accounts.includes(id)) u.accounts.push(id)
  if (!u.default) u.default = id
  write(data)
  return getBindings(k)
}

export function unbind(qq, accountId) {
  const data = read()
  const k = key(qq)
  const u = data.users[k]
  if (!u) return getBindings(k)
  u.accounts = (u.accounts || []).filter(x => String(x) !== String(accountId))
  if (String(u.default) === String(accountId)) u.default = u.accounts[0] || ''
  if (!u.accounts.length) delete data.users[k]
  write(data)
  return getBindings(k)
}

export function setDefault(qq, accountId) {
  const data = read()
  const k = key(qq)
  const u = data.users[k]
  if (!u || !(u.accounts || []).map(String).includes(String(accountId))) throw new Error('该账号不在你的绑定里')
  u.default = String(accountId)
  write(data)
  return getBindings(k)
}

/** 账号被删后清理所有用户的失效绑定 */
export function prune(validIds) {
  const valid = new Set((validIds || []).map(String))
  const data = read()
  let changed = false
  for (const [qq, u] of Object.entries(data.users)) {
    const next = (u.accounts || []).map(String).filter(id => valid.has(id))
    if (next.length !== (u.accounts || []).length) { u.accounts = next; changed = true }
    if (u.default && !valid.has(String(u.default))) { u.default = next[0] || ''; changed = true }
    if (!next.length) { delete data.users[qq]; changed = true }
  }
  if (changed) write(data)
  return data.users
}
