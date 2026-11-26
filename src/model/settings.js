/**
 * 设置模型：农场自动化、施肥与购买、种植策略、巡查时间。
 * 数据来自内置引擎（settings.get / settings.save），改完直接生效。
 */
import { call } from './engine.js'

export const FERT_OPTIONS = [
  { label: '普通 + 有机', value: 'both' },
  { label: '普通 + 快成熟有机', value: 'smart' },
  { label: '仅普通化肥', value: 'normal' },
  { label: '仅有机化肥', value: 'organic' },
  { label: '不施肥', value: 'none' },
]

export const STRATEGY_OPTIONS = [
  { label: '最高等级作物', value: 'level' },
  { label: '最大经验/时', value: 'max_exp' },
  { label: '最大普通肥经验/时', value: 'max_fert_exp' },
  { label: '最大净利润/时', value: 'max_profit' },
  { label: '最大普通肥净利润/时', value: 'max_fert_profit' },
  { label: '优先种植种子', value: 'preferred' },
  { label: '背包种子优先', value: 'bag_priority' },
]

export const LAND_TYPES = [
  { label: '蓝晶', value: 'blue-crystal' },
  { label: '紫金', value: 'purple-gold' },
  { label: '金', value: 'gold' },
  { label: '黑', value: 'black' },
  { label: '红', value: 'red' },
  { label: '普通', value: 'normal' },
]

export const landLabel = v => (LAND_TYPES.find(t => t.value === v) || {}).label || v
export const optionLabel = (options, v) => (options.find(o => o.value === v) || {}).label || String(v ?? '—')

const B = (no, g, name, key, extra = {}) => ({
  no, g, name, type: 'bool',
  get: s => s.automation?.[key],
  patch: v => ({ automation: { [key]: v } }),
  ...extra,
})

const N = (no, g, name, key, min, max, unit, extra = {}) => ({
  no, g, name, type: 'num', min, max, unit,
  get: s => key.startsWith('automation.')
    ? s.automation?.[key.slice(11)]
    : key.startsWith('intervals.')
      ? s.intervals?.[key.slice(10)]
      : s[key],
  patch: v => key.startsWith('automation.')
    ? { automation: { [key.slice(11)]: v } }
    : key.startsWith('intervals.')
      ? { intervals: { [key.slice(10)]: v } }
      : { [key]: v },
  ...extra,
})

/** 24 项设置 */
export const SETTINGS = [
  // ---------- 自动化 ----------
  B(1, '自动化', '自动种植收获', 'farm', { alias: ['种植收获'] }),
  {
    no: 2, g: '自动化', name: '自动务农', type: 'reverse_bool', alias: ['一键务农', '务农'],
    hint: '巡田时自动除草/除虫/浇水',
    get: s => s.automation?.skip_own_weed_bug === undefined ? true : !s.automation.skip_own_weed_bug,
    patch: v => ({ automation: { skip_own_weed_bug: !v } }),
  },
  B(3, '自动化', '自动收获天工作物', 'farm_harvest_tiangong', { alias: ['收获天工'] }),
  B(4, '自动化', '推送触发巡田', 'farm_push', { alias: ['推送巡田'] }),
  B(5, '自动化', '自动卖果实', 'sell', { alias: ['卖果实'], hint: '收获/偷取后自动出售果实' }),
  B(6, '自动化', '自动做任务', 'task', { alias: ['做任务'] }),
  B(7, '自动化', '自动升级土地', 'land_upgrade', { alias: ['升级土地'] }),
  B(8, '自动化', '自动喂狗', 'dog_auto_feed', { alias: ['喂狗'] }),

  // ---------- 施肥 ----------
  { no: 9, g: '施肥', name: '施肥策略', type: 'enum', options: FERT_OPTIONS, get: s => s.automation?.fertilizer, patch: v => ({ automation: { fertilizer: v } }) },
  { no: 10, g: '施肥', name: '施肥范围', type: 'landTypes', hint: '仅对选中土地类型的地块施肥', get: s => s.automation?.fertilizer_land_types, patch: v => ({ automation: { fertilizer_land_types: v } }) },
  N(11, '施肥', '快成熟秒数', 'automation.fertilizer_smart_seconds', 30, 3600, '秒', { hint: '距成熟 ≤ 此秒数时施有机肥（smart 策略用）' }),
  B(12, '施肥', '多季补肥', 'fertilizer_multi_season', { alias: ['补肥'] }),
  B(13, '施肥', '自动填充化肥', 'fertilizer_gift', { hint: '开礼包等方式补进化肥' }),

  // ---------- 施肥购买 ----------
  B(14, '施肥购买', '自动购买有机化肥', 'fertilizer_buy_organic', { alias: ['买有机'] }),
  N(15, '施肥购买', '有机购买数量', 'fertilizerBuyOrganicCount', 1, 10000, '个'),
  N(16, '施肥购买', '有机触发阈值', 'fertilizerBuyOrganicThresholdHours', 1, 990, '小时'),
  B(17, '施肥购买', '自动购买无机化肥', 'fertilizer_buy_normal', { alias: ['买无机'] }),
  N(18, '施肥购买', '无机购买数量', 'fertilizerBuyNormalCount', 1, 10000, '个'),
  N(19, '施肥购买', '无机触发阈值', 'fertilizerBuyNormalThresholdHours', 1, 990, '小时'),
  N(20, '施肥购买', '检测间隔', 'fertilizerBuyCheckIntervalMinutes', 1, 1440, '分钟'),

  // ---------- 种植策略 ----------
  { no: 21, g: '种植策略', name: '种植策略', type: 'enum', options: STRATEGY_OPTIONS, get: s => s.strategy, patch: v => ({ strategy: v }) },
  { no: 22, g: '种植策略', name: '种植顺序随机', type: 'bool', get: s => s.plantOrderRandom, patch: v => ({ plantOrderRandom: v }) },
  N(23, '种植策略', '种植延迟', 'plantDelaySeconds', 0, 600, '秒'),

  // ---------- 巡查时间 ----------
  N(24, '巡查时间', '农场巡查最小', 'intervals.farmMin', 1, 360, '分钟', { alias: ['巡查最小'] }),
  N(25, '巡查时间', '农场巡查最大', 'intervals.farmMax', 1, 360, '分钟', { alias: ['巡查最大'] }),
]

export function findSetting(nameOrNo) {
  const q = String(nameOrNo ?? '').trim()
  if (!q) return null
  if (/^\d+$/.test(q)) return SETTINGS.find(s => s.no === Number(q)) || null
  return SETTINGS.find(s => s.name === q)
    || SETTINGS.find(s => (s.alias || []).includes(q))
    || SETTINGS.find(s => s.name.includes(q) || q.includes(s.name)) || null
}

export function formatValue(item, s) {
  if (!s) return '—'
  const v = item.get(s)
  switch (item.type) {
    case 'bool':
    case 'reverse_bool': return v ? '开' : '关'
    case 'enum': return optionLabel(item.options, v)
    case 'num': return `${Number(v) || 0} ${item.unit || ''}`.trim()
    case 'landTypes': return (Array.isArray(v) ? v : []).map(landLabel).join('/') || '全部'
    default: return String(v ?? '—')
  }
}

function parseLandTypes(v) {
  const t = String(v || '').trim()
  if (/^(全部|all)$/i.test(t)) return LAND_TYPES.map(x => x.value)
  const tokens = t.split(/[、,，/\s]+/).filter(Boolean)
  if (!tokens.length) throw new Error('格式：蓝晶,紫金,金,黑,红,普通（或 全部）')
  const out = []
  for (const tk of tokens) {
    const hit = LAND_TYPES.find(x => x.label === tk || x.value === tk || x.label.startsWith(tk) || tk.startsWith(x.label))
    if (!hit) throw new Error(`未知土地类型「${tk}」，可选：${LAND_TYPES.map(x => x.label).join('/')}`)
    if (!out.includes(hit.value)) out.push(hit.value)
  }
  return out
}

/** 应用单项设置，返回 { no, name, valueText } */
export async function applySetting(accountId, nameOrNo, valueStr) {
  const item = findSetting(nameOrNo)
  if (!item) throw new Error(`没有「${nameOrNo}」这项，发 #农场设置 看编号`)
  const cur = await call('settings.get', { accountId })
  const v = String(valueStr ?? '').trim()
  let value

  if (item.type === 'bool' || item.type === 'reverse_bool') {
    if (/^(开|on|true|1|启用)$/i.test(v)) value = true
    else if (/^(关|off|false|0|停用)$/i.test(v)) value = false
    else throw new Error(`「${item.name}」只能填 开 / 关`)
  } else if (item.type === 'num') {
    const n = Number(v)
    if (!Number.isFinite(n) || n < item.min || n > item.max) throw new Error(`「${item.name}」要在 ${item.min}~${item.max} 之间`)
    value = Math.trunc(n)
  } else if (item.type === 'enum') {
    const hit = item.options.find(o => o.label === v) || item.options.find(o => o.value === v)
      || item.options.find(o => o.label.includes(v) || v.includes(o.label))
    if (!hit) throw new Error(`「${item.name}」可选：${item.options.map(o => o.label).join(' / ')}`)
    value = hit.value
  } else if (item.type === 'landTypes') {
    value = parseLandTypes(v)
  } else {
    throw new Error('该设置项暂不支持修改')
  }

  const patch = item.patch(value)
  await call('settings.save', { accountId, patch })
  const merged = {
    ...cur,
    ...patch,
    automation: { ...(cur.automation || {}), ...(patch.automation || {}) },
    intervals: { ...(cur.intervals || {}), ...(patch.intervals || {}) },
  }
  return { no: item.no, name: item.name, valueText: formatValue(item, merged) }
}
