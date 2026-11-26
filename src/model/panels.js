/**
 * 数据层：概览 / 我的农场 / 背包 / 设置。
 * 数据来自内置引擎（engine/runner.cjs），不再依赖面板服务。
 */
import { call, img } from './engine.js'
import { SETTINGS, formatValue } from './settings.js'

const num = n => {
  const v = Number(n) || 0
  if (Math.abs(v) >= 1e8) return (v / 1e8).toFixed(2).replace(/\.?0+$/, '') + '亿'
  if (Math.abs(v) >= 1e4) return (v / 1e4).toFixed(1).replace(/\.0$/, '') + '万'
  return v.toLocaleString('en-US')
}

const rawNum = n => Number(n) || 0

function fmtUptime(sec) {
  sec = Number(sec) || 0
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  return h > 0 ? `${h}小时${m}分` : `${m}分钟`
}

function fmtLeft(sec) {
  sec = Number(sec) || 0
  if (sec <= 0) return ''
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = Math.floor(sec % 60)
  if (h > 0) return `${h}时${m}分`
  if (m > 0) return `${m}分${s}秒`
  return `${s}秒`
}

function shortClock(sec) {
  const t = new Date(Date.now() + (Number(sec) || 0) * 1000)
  const p = n => String(n).padStart(2, '0')
  return `${p(t.getMonth() + 1)}/${p(t.getDate())} ${p(t.getHours())}:${p(t.getMinutes())}`
}

const ICON = {
  gold: '/game-config/seed_images_named/seed_images/1001.png',
  coupon: '/game-config/seed_images_named/seed_images/1002.png',
  diamond: '/game-config/seed_images_named/seed_images/1004.png',
  goldBean: '/game-config/seed_images_named/seed_images/1005.png',
  exp: '/game-config/seed_images_named/seed_images/1014.png',
}

// ============================ 概览 ============================

export async function getOverviewData(account) {
  const id = account.id
  const [st, lands] = await Promise.all([
    call('data.status', { accountId: id }).catch(() => ({})),
    call('data.lands', { accountId: id }).catch(() => ({})),
  ])
  const p = st?.status || {}
  const uptime = Number(st?.uptime) || 0
  const expGain = Number(st?.sessionExpGained) || 0
  const expPerHour = uptime > 5 ? Math.round(expGain / uptime * 3600) : 0

  let levelExp = { current: 0, needed: 0, pct: 0, leftHours: '' }
  try {
    const r = await call('game.levelProgress', { level: Number(p.level) || 1, exp: Number(p.exp) || 0 })
    if (r) {
      levelExp.current = r.current
      levelExp.needed = r.needed
      levelExp.pct = r.needed ? Math.round(r.current / r.needed * 100) : 0
      if (expPerHour > 0 && r.needed > r.current) {
        const hrs = (r.needed - r.current) / expPerHour
        levelExp.leftHours = hrs >= 1 ? `${hrs.toFixed(1)} 小时` : `${Math.max(1, Math.round(hrs * 60))} 分钟`
      }
    }
  } catch { /* 缺配置就不显示进度 */ }

  const ops = st?.operations || {}
  const today = {
    harvest: rawNum(ops.harvest),
    farming: rawNum(ops.farming),
    plant: rawNum(ops.plant),
    fertilize: rawNum(ops.fertilize),
    task: rawNum(ops.taskClaim),
  }

  return {
    icons: Object.fromEntries(Object.entries(ICON).map(([k, v]) => [k, img(v)])),
    account: {
      name: account.name,
      uin: account.uin || account.wxid || '',
      avatar: img(p.avatarUrl || account.avatar),
      level: p.level ?? '—',
      connected: !!st?.connection?.connected,
      uptime: fmtUptime(uptime),
    },
    exp: {
      current: num(levelExp.current),
      needed: num(levelExp.needed),
      pct: levelExp.pct,
      perHour: num(expPerHour),
      leftHours: levelExp.leftHours || '—',
      planted: rawNum(lands?.summary?.growing),
    },
    assets: {
      gold: num(p.gold),
      coupon: num(p.coupon),
      diamond: num(p.diamond),
      goldBean: num(p.goldBean),
    },
    today,
    todayTotal: Object.values(today).reduce((a, b) => a + b, 0),
  }
}

// ============================ 我的农场 ============================

export async function getFarmData(account) {
  const data = await call('data.lands', { accountId: account.id })
  const lands = Array.isArray(data?.lands) ? data.lands : []
  const s = data?.summary || {}
  const SOIL = { 0: '普通', 1: '普通', 2: '红土', 3: '黑土', 4: '金土', 5: '紫金', 6: '蓝晶' }

  const rows = lands.map(l => {
    const needs = []
    if (l.needWater) needs.push('water')
    if (l.needWeed) needs.push('weed')
    if (l.needBug) needs.push('bug')
    const total = Number(l.totalGrowTime) || 0
    const left = Number(l.matureInSec) || 0
    const pct = total > 0 ? Math.max(0, Math.min(100, Math.round((1 - left / total) * 100))) : 0
    const ripe = !!l.plantName && (left <= 0 || l.phaseName === '成熟')
    const effects = Array.isArray(l.mutantEffects) && l.mutantEffects.length
      ? l.mutantEffects
      : (Array.isArray(l.mutantConfigIds) ? l.mutantConfigIds.map(id => ({ id })) : [])
    const mutants = effects
      .map(e => ({ id: Number(e.id) || 0, name: String(e.name || '').trim() }))
      .filter(m => m.id > 0)
      .map(m => ({ ...m, img: img(`/game-config/seed_images_named/mutant/${m.id}.png`) }))

    return {
      id: l.id,
      empty: !l.plantName,
      plant: l.plantName || '',
      img: l.seedImage ? img(l.seedImage) : '',
      season: (Number(l.totalSeason) || 1) > 1 && l.plantName ? `${Number(l.currentSeason) || 1}/${Number(l.totalSeason)}季` : '',
      tick: left > 0 ? fmtLeft(left) : '',
      matureAt: left > 0 && !ripe ? shortClock(left) : '',
      pct,
      ripe,
      dead: l.status === 'dead' || l.phaseName === '枯死',
      needs,
      soil: SOIL[Number(l.level) || 0] || '普通',
      locked: !!l.locked,
      needLevel: Number(l.landInfo?.needLevel) || 0,
      upReady: !!l.couldUpgrade,
      mutants,
      displayPlant: String(l.plantName || '').replace(/^(黄金|白银|青铜|传说)[+·]\s*/, ''),
    }
  })

  return {
    account: { name: account.name, uin: account.uin || account.wxid || '' },
    summary: {
      total: lands.length,
      growing: rawNum(s.growing),
      ripe: rawNum(s.harvestable),
      empty: rawNum(s.empty),
      dead: rawNum(s.dead),
      needWater: rawNum(s.needWater),
      needWeed: rawNum(s.needWeed),
      needBug: rawNum(s.needBug),
    },
    lands: rows,
  }
}

// ============================ 背包 ============================

export async function getBagData(account) {
  const data = await call('data.bag', { accountId: account.id })
  const CAT = { fruit: '果实', seed: '种子', item: '道具', tool: '道具', mutant: '超变' }
  const ORDER = ['fruit', 'seed', 'item', 'tool', 'mutant']

  const list = (data?.items || []).map(i => ({
    name: String(i.name || '').replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').trim() || `#${i.id}`,
    img: img(i.image),
    count: rawNum(i.count),
    cat: i.category || 'item',
    locked: !!i.locked,
    mut: (i.mutantTypeNames || []).join(' + '),
  })).sort((a, b) => b.count - a.count)

  const groups = ORDER.map(cat => {
    const items = list.filter(i => i.cat === cat || (cat === 'item' && i.cat === 'tool'))
    return { cat, label: CAT[cat] || '其他', count: items.length, total: items.reduce((x, i) => x + i.count, 0), items }
  }).filter(g => g.items.length)

  return {
    account: { name: account.name, uin: account.uin || account.wxid || '' },
    totalKinds: list.length,
    totalCount: list.reduce((x, i) => x + i.count, 0),
    groups,
  }
}

// ============================ 设置 ============================

export async function getSettingsData(account) {
  const s = await call('settings.get', { accountId: account.id })
  const groups = []
  for (const item of SETTINGS) {
    let g = groups.find(x => x.name === item.g)
    if (!g) groups.push(g = { name: item.g, items: [] })
    g.items.push({
      no: item.no,
      name: item.name,
      hint: item.hint || '',
      valueText: formatValue(item, s),
      type: item.type,
    })
  }
  return { account: { name: account.name, uin: account.uin || account.wxid || '' }, groups }
}
