import { ctx, argsOf, pickAccount, sendImage, sendText } from '../model/ctx.js'
import * as panels from '../model/panels.js'
import { renderCard } from '../render/render.js'

export default async () => {
  const { e, message } = ctx()
  try {
    const { account } = await pickAccount(e, argsOf(e, '我的农场'))
    const data = await panels.getFarmData(account)
    const img = await renderCard('farm', data, { width: 640 })
    return sendImage(message, img)
  } catch (err) {
    return sendText(message, '【读取失败】' + err.message)
  }
}
