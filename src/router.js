import { defineRouter, lazy } from 'alemonjs'

/**
 * 命令路由：命中只负责分发，参数在响应里从 event.MessageText 解析。
 * 支持 # / ！ 前缀与不带前缀（按平台设置可能只允许部分前缀）。
 */
export default defineRouter([
  { regular: /^[#/／!！]?农场帮助$/, handler: lazy(() => import('./response/help.js')) },
  { regular: /^[#/／!！]?农场登录(?:\s|$)/, handler: lazy(() => import('./response/login.js')) },
  { regular: /^[#/／!！]?农场账号(?:\s|$)/, handler: lazy(() => import('./response/account.js')) },
  { regular: /^[#/／!！]?农场概览(?:\s|$)/, handler: lazy(() => import('./response/overview.js')) },
  { regular: /^[#/／!！]?我的农场(?:\s|$)/, handler: lazy(() => import('./response/farm.js')) },
  { regular: /^[#/／!！]?农场背包(?:\s|$)/, handler: lazy(() => import('./response/bag.js')) },
  { regular: /^[#/／!！]?农场设置(?:\s|$)/, handler: lazy(() => import('./response/settings.js')) }
])
