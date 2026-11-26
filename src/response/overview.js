import { ctx, argsOf, pickAccount, sendImage, sendText } from '../model/ctx.js'
import * as panels from '../model/panels.js'
import { renderCard } from '../render/render.js'

export default async () => {
  const { e, message } = ctx()
  try {
    const { account } = await pickAccount(e, argsOf(e, '农场概览'))
    const data = await panels.getOverviewData(account)
    const img = await renderCard('overview', data, { width: 430 })
    return sendImage(message, img)
  } catch (err) {
    return sendText(message, '【读取失败】' + err.message)
  }
}
