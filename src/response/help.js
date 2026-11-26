import { ctx, sendImage, sendText } from '../model/ctx.js'
import { renderCard } from '../render/render.js'

export default async () => {
  const { message } = ctx()
  try {
    const img = await renderCard('help', {}, { width: 520 })
    return sendImage(message, img)
  } catch (err) {
    return sendText(message, [
      '【Tci-Farm】',
      '#农场登录 输码 <code> / #农场登录 微信',
      '#农场账号 / #农场概览 / #我的农场 / #农场背包 / #农场设置',
      '',
      `渲染失败：${err.message}`
    ].join('\n'))
  }
}
