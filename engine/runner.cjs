'use strict'
/**
 * farm-lite 内置引擎
 *
 * 把面板（qq-farm-bot-pro）的运行核心抽出来直接跑：
 * - 不启动 Web 面板，不占 3007
 * - 账号登录 / 数据查询 / 设置读写全部走进程内 store + runtime-engine
 * - 与插件之间通过 IPC（process.send）通信，stdio 留给日志
 *
 * 子进程模式：runtime-engine 会用 FARM_WORKER=1 fork 本文件来跑账号 worker。
 */
const path = require('node:path')
const fs = require('node:fs')

const ENGINE_DIR = __dirname
const DIST = path.join(ENGINE_DIR, 'core', 'dist')
const DATA_DIR = process.env.FARM_DATA_DIR || path.join(ENGINE_DIR, '..', 'data', 'engine')

fs.mkdirSync(DATA_DIR, { recursive: true })
process.env.FARM_DATA_DIR = DATA_DIR
process.env.FARM_AUTO_START = '0'

if (process.env.FARM_WORKER === '1') {
  require(path.join(DIST, 'core', 'worker'))
} else {
  runHost()
}

function runHost() {
  const { createRuntimeEngine } = require(path.join(DIST, 'runtime', 'runtime-engine'))
  const store = require(path.join(DIST, 'models', 'store'))
  const { WxLoginService } = require(path.join(DIST, 'services', 'wx-login', 'service'))

  const TARGET_APP_ID = 'wx5306c5978fdb76e4'
  const wxLogin = new WxLoginService()
  const wxTasks = new Map()

  const engine = createRuntimeEngine({
    processRef: process,
    mainEntryPath: __filename,
    // 不提供面板服务：startAdminServer 传空函数且 start 时禁用
    startAdminServer: () => {},
    onStatusSync: () => {},
    onLog: () => {},
    onAccountLog: () => {},
    onConfigChanged: () => {},
  })

  let ready = false
  let startError = ''
  const engineReady = engine
    .start({ startAdminServer: false, autoStartAccounts: false, skipAccountRestore: true })
    .then(() => { ready = true })
    .catch(err => { startError = err && err.message ? err.message : String(err) })

  const provider = engine.dataProvider

  const pickAccount = id => {
    const list = store.getAccounts().accounts || []
    return list.find(a => String(a.id) === String(id)) || null
  }

  const accountView = a => {
    let status = null
    try { status = provider.getStatus(a.id)?.status || null } catch { /* 未运行时没有实时状态 */ }
    let running = false
    try { running = !!provider.isAccountRunning(a.id) } catch { /* ignore */ }
    return {
      id: String(a.id),
      name: a.name,
      platform: a.platform || 'qq',
      uin: String(a.uin || a.qq || ''),
      wxid: String(a.wxid || ''),
      avatar: String(a.avatar || status?.avatarUrl || ''),
      running,
      status: status ? {
        nickname: status.nickname || a.name,
        level: status.level ?? null,
        gold: status.gold ?? null,
        exp: status.exp ?? null,
      } : null,
      codeSet: !!a.code,
      updatedAt: Number(a.updatedAt) || 0,
    }
  }

  const saveAccount = payload => {
    const before = new Set((store.getAccounts().accounts || []).map(x => String(x.id)))
    const data = store.addOrUpdateAccount(payload)
    const list = data.accounts || []
    return list.find(x => !before.has(String(x.id)))
      || list.find(x => String(x.name) === String(payload.name))
      || list[list.length - 1]
  }

  async function startAccount(acc) {
    const started = await provider.startAccount(String(acc.id), true)
    return { started: !!started }
  }

  /** 对引擎里已有的全部账号执行一次精简默认（关闭好友互动/牧场/神秘商人） */
  async function applyLiteDefaultsToAll() {
    const list = store.getAccounts().accounts || []
    for (const acc of list) await applyLiteDefaults(acc.id)
  }

  /**
   * 精简版默认配置：好友互动、牧场、神秘商人全部关闭。
   * 只在新建/重新登录账号时执行一次，用户之后也可以在设置里手动改回来。
   */
  async function applyLiteDefaults(accountId) {
    try {
      const auto = store.getAutomation(accountId) || {}
      const patch = {}
      for (const [k, v] of Object.entries(auto)) {
        if (!/^ranch_|^friend($|_)|^mystery_shop_/.test(k)) continue
        if (typeof v === 'boolean') patch[k] = false
      }
      patch.friend = false
      await provider.saveSettings(String(accountId), { automation: patch })
    } catch (e) {
      console.error('[engine] 精简版默认配置写入失败: ' + e.message)
    }
  }

  const settingsSnapshot = id => {
    const s = store
    return {
      intervals: s.getIntervals(id),
      strategy: s.getPlantingStrategy(id),
      preferredSeed: s.getPreferredSeed(id),
      friendQuietHours: s.getFriendQuietHours(id),
      automation: s.getAutomation(id),
      autoCodeRefresh: s.getConfigSnapshot(id).autoCodeRefresh,
      stealDelaySeconds: s.getStealDelaySeconds ? s.getStealDelaySeconds(id) : 0,
      plantOrderRandom: s.getPlantOrderRandom ? s.getPlantOrderRandom(id) : false,
      plantDelaySeconds: s.getPlantDelaySeconds ? s.getPlantDelaySeconds(id) : 0,
      fertilizerBuyOrganicCount: s.getFertilizerBuyOrganicCount ? s.getFertilizerBuyOrganicCount(id) : 0,
      fertilizerBuyOrganicThresholdHours: s.getFertilizerBuyOrganicThresholdHours ? s.getFertilizerBuyOrganicThresholdHours(id) : 10,
      fertilizerBuyNormalCount: s.getFertilizerBuyNormalCount ? s.getFertilizerBuyNormalCount(id) : 0,
      fertilizerBuyNormalThresholdHours: s.getFertilizerBuyNormalThresholdHours ? s.getFertilizerBuyNormalThresholdHours(id) : 10,
      fertilizerBuyCheckIntervalMinutes: s.getFertilizerBuyCheckIntervalMinutes ? s.getFertilizerBuyCheckIntervalMinutes(id) : 60,
      bagSeedPriority: s.getBagSeedPriority ? s.getBagSeedPriority(id) : [],
      bagSeedMultiLandReservationEnabled: s.getBagSeedMultiLandReservationEnabled ? s.getBagSeedMultiLandReservationEnabled(id) : false,
      bagSeedLandTypes: s.getBagSeedLandTypes ? s.getBagSeedLandTypes(id) : {},
      bagSeedFallbackStrategy: s.getBagSeedFallbackStrategy ? s.getBagSeedFallbackStrategy(id) : 'level',
      plantBlacklist: s.getPlantBlacklist ? s.getPlantBlacklist(id) : [],
    }
  }

  const methods = {
    ping: async () => ({ ok: true, ready, startError, dataDir: DATA_DIR }),

    'accounts.list': async () => ({
      accounts: (store.getAccounts().accounts || []).map(accountView),
    }),

    'accounts.start': async ({ id }) => {
      const acc = pickAccount(id)
      if (!acc) throw new Error('账号不存在')
      return startAccount(acc)
    },

    'accounts.stop': async ({ id }) => {
      const ok = await provider.stopAccount(String(id))
      return { stopped: !!ok }
    },

    'accounts.remove': async ({ id }) => {
      try { await provider.stopAccount(String(id)) } catch { /* 未运行忽略 */ }
      store.deleteAccount(String(id))
      return { removed: true }
    },

    'accounts.rename': async ({ id, name }) => {
      const acc = pickAccount(id)
      if (!acc) throw new Error('账号不存在')
      saveAccount({ ...acc, name: String(name || acc.name) })
      return { ok: true }
    },

    /** QQ 抓包 code 登录：新增账号并用该 code 启动 */
    'login.code': async ({ name, code, platform = 'qq', uin }) => {
      const accountName = String(name || '').trim()
      const loginCode = String(code || '').trim()
      if (!accountName) throw new Error('账号备注不能为空')
      if (!loginCode) throw new Error('缺少 code')
      const payload = {
        name: accountName,
        platform: platform === 'wx' ? 'wx' : 'qq',
        code: loginCode,
      }
      if (uin) { payload.uin = String(uin); payload.qq = String(uin) }
      const acc = saveAccount(payload)
      await applyLiteDefaults(acc.id)
      const r = await startAccount(acc)
      return { id: String(acc.id), name: acc.name, started: r.started }
    },

    /** 微信扫码：创建二维码会话 */
    'login.wxStart': async () => {
      const { session, qr } = await wxLogin.createQrSession()
      const taskId = 'wx' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
      wxTasks.set(taskId, { session, createdAt: Date.now() })
      // 清理 10 分钟前的任务
      for (const [k, v] of wxTasks) if (Date.now() - v.createdAt > 10 * 60 * 1000) wxTasks.delete(k)
      return { taskId, qrBase64: qr.toString('base64') }
    },

    'login.wxPoll': async ({ taskId }) => {
      const t = wxTasks.get(taskId)
      if (!t) throw new Error('二维码已失效，请重新发起 #农场登录 微信')
      const status = await wxLogin.poll(t.session)
      return { status }
    },

    /** 微信扫码：确认并把账号写入 store 后启动 */
    'login.wxConfirm': async ({ taskId, name }) => {
      const t = wxTasks.get(taskId)
      if (!t) throw new Error('二维码已失效，请重新发起 #农场登录 微信')
      const { openid } = await wxLogin.confirm(t.session)
      const code = await wxLogin.issueCode(t.session, TARGET_APP_ID)
      const accountName = String(name || t.session.nickname || openid.slice(0, 8)).trim()
      const acc = saveAccount({
        name: accountName,
        platform: 'wx',
        wxid: openid,
        code,
        loginBuffer: t.session.loginBuffer || '',
        refreshtoken: t.session.refreshtoken || '',
        accesstoken: t.session.accesstoken || '',
      })
      wxTasks.delete(taskId)
      await applyLiteDefaults(acc.id)
      const r = await startAccount(acc)
      return { id: String(acc.id), name: acc.name, nickname: t.session.nickname || '', started: r.started }
    },

    'data.status': async ({ accountId }) => provider.getStatus(String(accountId)) || {},
    'data.lands': async ({ accountId }) => provider.getLands(String(accountId)) || {},
    'data.bag': async ({ accountId }) => provider.getBag(String(accountId)) || {},
    'data.diamond': async ({ accountId }) => ({ diamond: await provider.getDiamondBalance(String(accountId)).catch(() => 0) }),

    'settings.get': async ({ accountId }) => settingsSnapshot(String(accountId)),
    'settings.save': async ({ accountId, patch }) => {
      const data = await provider.saveSettings(String(accountId), patch || {})
      return { saved: !!(data && data.saved), status: data && data.status }
    },

    'game.seeds': async () => {
      try {
        const gc = require(path.join(DIST, 'config', 'gameConfig'))
        return { seeds: gc.getAllSeeds ? gc.getAllSeeds() : [] }
      } catch (e) {
        return { seeds: [], error: e.message }
      }
    },

    'game.levelProgress': async ({ level, exp }) => {
      try {
        const gc = require(path.join(DIST, 'config', 'gameConfig'))
        return gc.getLevelExpProgress ? gc.getLevelExpProgress(Number(level) || 1, Number(exp) || 0) : null
      } catch {
        return null
      }
    },
  }

  process.on('message', async msg => {
    if (!msg || msg.type !== 'rpc') return
    const { id, method, params } = msg
    const reply = (ok, payload) => {
      try {
        process.send({ type: 'rpc', id, ok, ...(ok ? { result: payload } : { error: payload }) })
      } catch { /* IPC 已断开 */ }
    }
    try {
      await engineReady
      const fn = methods[method]
      if (!fn) throw new Error('未知方法: ' + method)
      reply(true, await fn(params || {}))
    } catch (err) {
      reply(false, err && err.message ? err.message : String(err))
    }
  })

  process.on('uncaughtException', err => {
    console.error('[engine] uncaughtException:', err && err.stack ? err.stack : err)
  })
  process.on('unhandledRejection', err => {
    console.error('[engine] unhandledRejection:', err && err.stack ? err.stack : err)
  })

  engineReady.then(async () => {
    console.log('[engine] runtime ready, dataDir=' + DATA_DIR)
    try { await applyLiteDefaultsToAll() } catch (e) { console.error('[engine] 精简默认应用失败: ' + e.message) }
  })
    .catch(err => console.error('[engine] runtime start failed: ' + (err && err.message)))
}
