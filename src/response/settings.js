import { ctx, argsOf, pickAccount, sendImage, sendText } from '../model/ctx.js'
import * as panels from '../model/panels.js'
import * as settings from '../model/settings.js'
import { renderCard } from '../render/render.js'

/**
 * #农场设置                 → 默认账号设置图
 * #农场设置 2               → 第 2 个绑定账号设置图
 * #农场设置 5 关             → 默认账号第 5 项
 * #农场设置 施肥策略 不施肥    → 按名称
 * #农场设置 2 5 关           → 第 2 个账号第 5 项
 */
export default async () => {
  const { e, message } = ctx()
  const arg = argsOf(e, '农场设置')
  try {
    const { account, rest } = await pickAccount(e, arg)
    if (!rest) {
      const data = await panels.getSettingsData(account)
      const img = await renderCard('settings', data, { width: 520 })
      return sendImage(message, img)
    }

    const tokens = rest.split(/\s+/).filter(Boolean)
    const key = tokens[0]
    const value = tokens.slice(1).join(' ')
    if (!value) {
      return sendText(message, [
        '用法：#农场设置 编号 值',
        '· 开关：#农场设置 5 关',
        '· 数值：#农场设置 24 45',
        '· 名称：#农场设置 施肥策略 不施肥',
        '· 指定农场：#农场设置 2 5 关'
      ].join('\n'))
    }
    const r = await settings.applySetting(account.id, key, value)
    return sendText(message, [
      '【设置成功】',
      `· 农场：${account.name}`,
      `· ${r.no}. ${r.name}：${r.valueText}`,
      '· 已即时生效'
    ].join('\n'))
  } catch (err) {
    return sendText(message, `【设置失败】${err.message}`)
  }
}
