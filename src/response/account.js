import { ctx, argsOf, userAccounts, setDefaultAccount, unbindUser, sendText } from '../model/ctx.js'
import { call } from '../model/engine.js'

export default async () => {
  const { e, message } = ctx()
  const arg = argsOf(e, '农场账号')
  let data
  try {
    data = await userAccounts(e)
  } catch (err) {
    return sendText(message, `【读取失败】${err.message}`)
  }

  const mDefault = /^默认\s*(\d{1,2})$/.exec(arg)
  if (mDefault) {
    const acc = data.mine[Number(mDefault[1]) - 1]
    if (!acc) return sendText(message, `没有第 ${mDefault[1]} 个农场`)
    setDefaultAccount(e, acc.id)
    return sendText(message, `已把「${acc.name}」设为默认农场`)
  }

  const mUnbind = /^解绑\s*(\d{1,2})$/.exec(arg)
  if (mUnbind) {
    const acc = data.mine[Number(mUnbind[1]) - 1]
    if (!acc) return sendText(message, `没有第 ${mUnbind[1]} 个农场`)
    unbindUser(e, acc.id)
    return sendText(message, `已解绑「${acc.name}」（账号仍在引擎里保留；要删号发 #农场账号 删除 ${mUnbind[1]}）`)
  }

  const mDel = /^删除\s*(\d{1,2})$/.exec(arg)
  if (mDel) {
    const acc = data.mine[Number(mDel[1]) - 1]
    if (!acc) return sendText(message, `没有第 ${mDel[1]} 个农场`)
    await call('accounts.remove', { id: acc.id })
    unbindUser(e, acc.id)
    return sendText(message, `已删除「${acc.name}」并停止挂机`)
  }

  if (!data.mine.length) {
    return sendText(message, '你还没有绑定农场：\n· QQ：#农场登录 输码 <code>\n· 微信：#农场登录 微信')
  }

  const lines = ['【我的农场】']
  data.mine.forEach((a, i) => {
    const mark = String(a.id) === String(data.defaultId) ? '（默认）' : ''
    const state = a.running ? '在线' : '离线'
    const nickname = a.status?.nickname ? ` · ${a.status.nickname}` : ''
    lines.push(`${i + 1}. ${a.name}${mark} · ${a.platform === 'wx' ? '微信' : 'QQ'} · ${state}${nickname}`)
  })
  lines.push('· 切换查看：#我的农场 2')
  lines.push('· 管理：#农场账号 默认 2 / 解绑 2 / 删除 2')
  return sendText(message, lines.join('\n'))
}
