/**
 * Tci-Farm 精简版占位：services/ranch/daily.js 的功能（好友互动 / 牧场）已整体移除。
 * 保留导出仅为兼容上游调度器的调用点，实际不执行任何游戏请求。
 */
const impl = { markTasksChanged: () => {}, }
const handler = {
  get(target, prop) {
    if (prop in target) return target[prop]
    if (prop === 'then') return undefined
    if (prop === '__esModule') return false
    return () => undefined
  },
}
module.exports = new Proxy(impl, handler)
