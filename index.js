/**
 * 农场精简版（JiuLi 插件）
 *
 * 自带引擎（engine/runner.cjs），不依赖面板服务。
 * 权限：所有人可用；一个用户可绑定多个农场账号。
 * 登录：#农场登录 输码 <code> / #农场登录 微信
 */
import { JiuLiPlugin, segment } from '../../lib/index.js'
import * as engine from './model/engine.js'
import * as bindings from './model/bindings.js'
import * as panels from './model/panels.js'
import * as settings from './model/settings.js'

const sleep = ms => new Promise(r => setTimeout(r, ms))

export default class TciFarm extends JiuLiPlugin {
  constructor() {
    super({
      name: 'Tci-Farm',
      dsc: '自带引擎的农场助手：概览/地块/背包/设置/登录',
      event: 'message',
      priority: 480,
      rule: [
        { reg: '^#农场帮助', fnc: 'help' },
        { reg: '^#农场登录', fnc: 'loginCmd' },
        { reg: '^#农场账号', fnc: 'accountCmd' },
        { reg: '^#农场概览', fnc: 'overviewCmd' },
        { reg: '^#我的农场', fnc: 'farmCmd' },
        { reg: '^#农场背包', fnc: 'bagCmd' },
        { reg: '^#农场设置', fnc: 'settingsCmd' },
      ],
    })
    // 插件加载即拉起引擎：预热 + 定期健康检查（热重载不会重复注册）
    const G = globalThis.__tciFarmBoot || (globalThis.__tciFarmBoot = {})
    if (G.timer) clearInterval(G.timer)
    setTimeout(() => {
      engine.call('ping').then(() => console.log('[Tci-Farm] 引擎已就绪')).catch(err => console.error('[Tci-Farm] 引擎启动失败：' + err.message))
    }, 1200)
    G.timer = setInterval(() => { engine.ensureHealthy().catch(() => {}) }, 10 * 60 * 1000)
    G.timer.unref?.()
  }

  async render(tpl, data = {}, opts = {}) {
    return super.render(tpl, { ...data, imgType: 'png' }, { ...opts, imgType: 'png' })
  }

  uid(e) {
    return String(e?.user_id || e?.sender?.user_id || e?.sender?.qq || '')
  }

  async reply(e, content) {
    try {
      if (typeof e?.reply === 'function') return e.reply(content)
      return false
    } catch {
      return false
    }
  }

  /** 引擎账号列表 + 当前用户绑定，返回可操作账号 */
  async userAccounts(e) {
    const { accounts } = await engine.call('accounts.list')
    const valid = new Set(accounts.map(a => String(a.id)))
    bindings.prune([...valid])
    const b = bindings.getBindings(this.uid(e))
    const mine = b.accounts.filter(id => valid.has(id))
    return {
      all: accounts,
      mine: mine.map(id => accounts.find(a => String(a.id) === id)).filter(Boolean),
      defaultId: b.defaultId,
    }
  }

  /**
   * 解析「账号序号 + 剩余参数」。
   * 序号 = 用户绑定列表里的第 N 个；不带序号用默认账号。
   */
  async pickAccount(e, text) {
    const { mine, defaultId } = await this.userAccounts(e)
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
    return { account: mine[idx], list: mine, rest, index: idx }
  }

  async card(e, tpl, loader, account) {
    try {
      const data = await loader(account)
      const img = await this.render(tpl, data)
      if (!img) return this.reply(e, '图片渲染失败：请检查 resources/farm 下的模板与主题文件')
      return this.reply(e, img)
    } catch (err) {
      return this.reply(e, `【读取失败】${err.message}`)
    }
  }

  // ---------------- 帮助 ----------------

  async help(e) {
    const img = await this.render('farm/help', {})
    if (!img) return this.reply(e, [
      '【农场精简版】',
      '#农场登录 输码 <code> / #农场登录 微信',
      '#农场账号 / #农场概览 / #我的农场 / #农场背包 / #农场设置',
    ].join('\n'))
    return this.reply(e, img)
  }

  // ---------------- 登录 ----------------

  async loginCmd(e) {
    const arg = String(e.msg || '').replace(/^#农场登录\s*/, '').trim()
    if (/^(微信|wx|wechat)$/i.test(arg)) return this.loginWx(e)
    const m = /^(?:输码|code)\s+([\w-]{8,})$/.exec(arg)
    if (m) return this.loginCode(e, m[1])
    if (!arg) {
      return this.reply(e, [
        '用法：',
        '· QQ：#农场登录 输码 <code>',
        '· 微信：#农场登录 微信（扫码后自动建号）',
        '· 同名账号会自动更新 code 并重启挂机',
      ].join('\n'))
    }
    return this.reply(e, 'code 太短或格式不对：请发 #农场登录 输码 <完整code>')
  }

  async loginCode(e, code) {
    await this.reply(e, '正在登录并启动挂机…')
    try {
      const { mine } = await this.userAccounts(e).catch(() => ({ mine: [] }))
      // QQ 抓包 code 里没有昵称，用 code 尾号建号；同名账号会沿用原备注并更新 code
      const name = mine.length ? mine[0].name : `农场${code.slice(-6)}`
      const r = await engine.call('login.code', { name, code, platform: 'qq' })
      bindings.bind(this.uid(e), r.id)
      return this.reply(e, [
        '【登录成功】',
        `· 账号：${r.name}（#${r.id}）`,
        r.started ? '· 已开始挂机，自动化按设置执行' : '· 账号已保存，但启动失败（code 可能已过期）',
        '· #农场概览 看状态 · #农场设置 改配置',
      ].join('\n'))
    } catch (err) {
      return this.reply(e, `【登录失败】${err.message}`)
    }
  }

  async loginWx(e) {
    try {
      const start = await engine.call('login.wxStart', {}, 60000)
      await this.reply(e, [
        segment.image(Buffer.from(start.qrBase64, 'base64')),
        '\n微信扫码登录农场，扫完后自动建号并开始挂机（2 分钟内有效）',
      ])
      this.watchWx(e, start.taskId)
    } catch (err) {
      return this.reply(e, `【二维码生成失败】${err.message}`)
    }
  }

  async watchWx(e, taskId) {
    const uid = this.uid(e)
    for (let i = 0; i < 60; i++) {
      await sleep(2000)
      let r
      try {
        r = await engine.call('login.wxPoll', { taskId })
      } catch (err) {
        return this.reply(e, `【扫码中断】${err.message}`)
      }
      if (r.status === 'waiting' || r.status === 'scanned') continue
      if (r.status === 'authorized') {
        try {
          const res = await engine.call('login.wxConfirm', { taskId }, 90000)
          bindings.bind(uid, res.id)
          return this.reply(e, [
            '【微信登录成功】',
            `· 账号：${res.name}${res.nickname ? `（${res.nickname}）` : ''}（#${res.id}）`,
            res.started ? '· 已开始挂机' : '· 账号已保存，启动失败请重试 #农场登录 微信',
          ].join('\n'))
        } catch (err) {
          return this.reply(e, `【登录确认失败】${err.message}`)
        }
      }
      if (r.status === 'expired') return this.reply(e, '二维码已过期，请重新 #农场登录 微信')
      if (r.status === 'cancelled') return this.reply(e, '已取消扫码')
    }
    return this.reply(e, '扫码超时，请重新 #农场登录 微信')
  }

  // ---------------- 账号管理 ----------------

  async accountCmd(e) {
    const arg = String(e.msg || '').replace(/^#农场账号\s*/, '').trim()
    let data
    try {
      data = await this.userAccounts(e)
    } catch (err) {
      return this.reply(e, `【读取失败】${err.message}`)
    }

    const mDefault = /^默认\s*(\d{1,2})$/.exec(arg)
    if (mDefault) {
      const acc = data.mine[Number(mDefault[1]) - 1]
      if (!acc) return this.reply(e, `没有第 ${mDefault[1]} 个农场`)
      bindings.setDefault(this.uid(e), acc.id)
      return this.reply(e, `已把「${acc.name}」设为默认农场`)
    }

    const mUnbind = /^解绑\s*(\d{1,2})$/.exec(arg)
    if (mUnbind) {
      const acc = data.mine[Number(mUnbind[1]) - 1]
      if (!acc) return this.reply(e, `没有第 ${mUnbind[1]} 个农场`)
      bindings.unbind(this.uid(e), acc.id)
      return this.reply(e, `已解绑「${acc.name}」（账号仍在引擎里保留；要删号发 #农场账号 删除 ${mUnbind[1]}）`)
    }

    const mDel = /^删除\s*(\d{1,2})$/.exec(arg)
    if (mDel) {
      const acc = data.mine[Number(mDel[1]) - 1]
      if (!acc) return this.reply(e, `没有第 ${mDel[1]} 个农场`)
      await engine.call('accounts.remove', { id: acc.id })
      bindings.unbind(this.uid(e), acc.id)
      return this.reply(e, `已删除「${acc.name}」并停止挂机`)
    }

    if (!data.mine.length) {
      return this.reply(e, '你还没有绑定农场：\n· QQ：#农场登录 输码 <code>\n· 微信：#农场登录 微信')
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
    return this.reply(e, lines.join('\n'))
  }

  // ---------------- 查看 ----------------

  async overviewCmd(e) {
    try {
      const { account } = await this.pickAccount(e, (e.msg || '').replace(/^#农场概览\s*/, ''))
      return this.card(e, 'farm/overview', panels.getOverviewData, account)
    } catch (err) {
      return this.reply(e, err.message)
    }
  }

  async farmCmd(e) {
    try {
      const { account } = await this.pickAccount(e, (e.msg || '').replace(/^#我的农场\s*/, ''))
      return this.card(e, 'farm/farm', panels.getFarmData, account)
    } catch (err) {
      return this.reply(e, err.message)
    }
  }

  async bagCmd(e) {
    try {
      const { account } = await this.pickAccount(e, (e.msg || '').replace(/^#农场背包\s*/, ''))
      return this.card(e, 'farm/bag', panels.getBagData, account)
    } catch (err) {
      return this.reply(e, err.message)
    }
  }

  /**
   * #农场设置                → 默认账号设置图
   * #农场设置 2              → 第 2 个绑定账号设置图
   * #农场设置 5 关            → 默认账号第 5 项
   * #农场设置 施肥策略 不施肥   → 按名称
   * #农场设置 2 5 关          → 第 2 个账号第 5 项
   */
  async settingsCmd(e) {
    const arg = String(e.msg || '').replace(/^#农场设置\s*/, '').trim()
    try {
      const { account, rest } = await this.pickAccount(e, arg)
      if (!rest) return this.card(e, 'farm/settings', panels.getSettingsData, account)

      const tokens = rest.split(/\s+/).filter(Boolean)
      const key = tokens[0]
      const value = tokens.slice(1).join(' ')
      if (!value) {
        return this.reply(e, [
          '用法：#农场设置 编号 值',
          '· 开关：#农场设置 5 关',
          '· 数值：#农场设置 24 45',
          '· 名称：#农场设置 施肥策略 不施肥',
          '· 指定农场：#农场设置 2 5 关',
        ].join('\n'))
      }
      const r = await settings.applySetting(account.id, key, value)
      return this.reply(e, [
        '【设置成功】',
        `· 农场：${account.name}`,
        `· ${r.no}. ${r.name}：${r.valueText}`,
        '· 已即时生效',
      ].join('\n'))
    } catch (err) {
      return this.reply(e, `【设置失败】${err.message}`)
    }
  }
}
