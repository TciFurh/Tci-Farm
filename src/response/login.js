import { ctx, argsOf, bindUser, sendImage, sendText } from '../model/ctx.js'
import { call } from '../model/engine.js'

const sleep = ms => new Promise(r => setTimeout(r, ms))

export default async () => {
  const { e, message } = ctx()
  const arg = argsOf(e, '农场登录')

  if (/^(微信|wx|wechat)$/i.test(arg)) return loginWx(e, message)
  const m = /^(?:输码|code)\s+([\w-]{8,})$/.exec(arg)
  if (m) return loginCode(e, message, m[1])
  if (!arg) {
    return sendText(message, [
      '用法：',
      '· QQ：#农场登录 输码 <code>',
      '· 微信：#农场登录 微信（扫码后自动建号）',
      '· 同名账号会自动更新 code 并重启挂机',
      '· code 有有效期，过期后需要重新输码'
    ].join('\n'))
  }
  return sendText(message, 'code 太短或格式不对：请发 #农场登录 输码 <完整code>')
}

async function loginCode(e, message, code) {
  await sendText(message, '正在登录并启动挂机…（code 有过期时间，过期需重新输码）')
  try {
    const name = `农场${code.slice(-6)}`
    const r = await call('login.code', { name, code, platform: 'qq' })
    bindUser(e, r.id)
    return sendText(message, [
      '【登录成功】',
      `· 账号：${r.name}（#${r.id}）`,
      r.started ? '· 已开始挂机，自动化按设置执行' : '· 账号已保存，但启动失败（code 可能已过期）',
      '· 注意：code 会过期，掉线后重新 #农场登录 输码 <新code> 即可',
      '· #农场概览 看状态 · #农场设置 改配置'
    ].join('\n'))
  } catch (err) {
    return sendText(message, `【登录失败】${err.message}`)
  }
}

async function loginWx(e, message) {
  let start
  try {
    start = await call('login.wxStart', {}, 60000)
  } catch (err) {
    return sendText(message, `【二维码生成失败】${err.message}`)
  }
  await sendImage(message, `base64://${start.qrBase64}`, '\n微信扫码登录农场，扫完后自动建号并开始挂机（2 分钟内有效）')

  // 扫码结果在后台轮询，完成后主动发回结果
  for (let i = 0; i < 60; i++) {
    await sleep(2000)
    let r
    try {
      r = await call('login.wxPoll', { taskId: start.taskId })
    } catch (err) {
      return sendText(message, `【扫码中断】${err.message}`)
    }
    if (r.status === 'waiting' || r.status === 'scanned') continue
    if (r.status === 'authorized') {
      try {
        const res = await call('login.wxConfirm', { taskId: start.taskId }, 90000)
        bindUser(e, res.id)
        return sendText(message, [
          '【微信登录成功】',
          `· 账号：${res.name}${res.nickname ? `（${res.nickname}）` : ''}（#${res.id}）`,
          res.started ? '· 已开始挂机' : '· 账号已保存，启动失败请重试 #农场登录 微信',
          '· #农场概览 看状态'
        ].join('\n'))
      } catch (err) {
        return sendText(message, `【登录确认失败】${err.message}`)
      }
    }
    if (r.status === 'expired') return sendText(message, '二维码已过期，请重新 #农场登录 微信')
    if (r.status === 'cancelled') return sendText(message, '已取消扫码')
  }
  return sendText(message, '扫码超时，请重新 #农场登录 微信')
}
