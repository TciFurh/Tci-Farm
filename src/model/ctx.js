/** ALemonJS 适配层：事件/消息工具、账号解析与回复封装。 */
import { useEvent, useMessage, Format } from 'alemonjs'
import { call } from './engine.js'
import * as bindings from './bindings.js'

export function ctx() {
  const [e] = useEvent()
  const [message] = useMessage()
  return { e, message }
}

export function uidOf(e) {
  return String(e?.UserId || e?.current?.UserId || e?.user_id || e?.sender?.UserId || '')
}

export function textOf(e) {
  return String(e?.MessageText ?? e?.current?.MessageText ?? e?.msg ?? '')
}

/** 去掉命令前缀与命令名，返回剩余参数 */
export function argsOf(e, command) {
  const text = textOf(e).trim()
  const m = new RegExp('^[#/／!！]?' + command + '\\s*')
  return text.replace(m, '').trim()
}

export async function sendText(message, text) {
  return message.send({ format: Format.create().addText(String(text)) })
}

export async function sendImage(message, image, caption) {
  const format = Format.create()
  if (caption) format.addText(caption)
  format.addImage(image)
  return message.send({ format })
}

/** 引擎账号列表 + 用户绑定 */
export async function userAccounts(e) {
  const { accounts } = await call('accounts.list')
  const valid = new Set(accounts.map(a => String(a.id)))
  bindings.prune([...valid])
  const b = bindings.getBindings(uidOf(e))
  const mine = b.accounts.filter(id => valid.has(id))
  return {
    all: accounts,
    mine: mine.map(id => accounts.find(a => String(a.id) === id)).filter(Boolean),
    defaultId: b.defaultId
  }
}

/**
 * 解析「账号序号 + 剩余参数」，序号指用户绑定列表的第 N 个。
 * 不带序号时用默认账号。
 */
export async function pickAccount(e, text) {
  const { mine, defaultId } = await userAccounts(e)
  if (!mine.length) throw new Error('你还没有绑定农场\n· QQ：#农场登录 输码 <code>\n· 微信：#农场登录 微信')
  const t = String(text || '').trim()
  const m = /^(\d{1,2})(?:\s+|$)/.exec(t)
  let idx = 0
  let rest = t
  if (m) {
    idx = Number(m[1]) - 1
    rest = t.slice(m[0].length).trim()
    if (!mine[idx]) throw new Error(`你只绑定了 ${mine.length} 个农场，没有第 ${m[1]} 个`)
  } else if (defaultId && mine.some(a => String(a.id) === String(defaultId))) {
    idx = mine.findIndex(a => String(a.id) === String(defaultId))
  }
  return { account: mine[idx], list: mine, rest }
}

export function bindUser(e, accountId) {
  return bindings.bind(uidOf(e), accountId)
}

export function unbindUser(e, accountId) {
  return bindings.unbind(uidOf(e), accountId)
}

export function setDefaultAccount(e, accountId) {
  return bindings.setDefault(uidOf(e), accountId)
}
