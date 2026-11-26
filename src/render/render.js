/**
 * 图片渲染：art-template 渲染 HTML → 内联图片/主题 → 系统浏览器截图 → base64。
 * 不依赖任何面板服务，也不需要下载 Chromium（用本机 Edge/Chrome）。
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const art = require('art-template')

const __dir = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dir, '..', '..')
const TPL_DIR = path.join(ROOT, 'resources', 'farm')
const THEME = path.join(TPL_DIR, 'theme.css')

const G = globalThis.__tciFarmRender || (globalThis.__tciFarmRender = { browser: null, launching: null })

/** 本机浏览器候选（可通过 TCI_BROWSER 指定） */
function findBrowser() {
  const env = String(process.env.TCI_BROWSER || '').trim()
  if (env && fs.existsSync(env)) return env
  const candidates = [
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/microsoft-edge'
  ]
  for (const p of candidates) {
    try { if (fs.existsSync(p)) return p } catch { /* ignore */ }
  }
  return ''
}

async function getBrowser() {
  if (G.browser?.connected) return G.browser
  if (G.launching) return G.launching
  G.launching = (async () => {
    const executablePath = findBrowser()
    if (!executablePath) throw new Error('未找到 Edge/Chrome，可用环境变量 TCI_BROWSER 指定浏览器路径')
    const { default: puppeteer } = await import('puppeteer-core')
    const browser = await puppeteer.launch({
      executablePath,
      headless: true,
      args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--mute-audio']
    })
    G.browser = browser
    return browser
  })().finally(() => { G.launching = null })
  return G.launching
}

/** file:// 图片转 data URI，避免页面加载外部资源 */
function inlineFileImages(html) {
  return html.replace(/src="file:\/\/\/([^"]+)"/g, (m, raw) => {
    try {
      const p = decodeURIComponent(raw)
      const buf = fs.readFileSync(p)
      const ext = path.extname(p).toLowerCase()
      const mime = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : ext === '.webp' ? 'image/webp' : 'image/png'
      return `src="data:${mime};base64,${buf.toString('base64')}"`
    } catch {
      return 'src=""'
    }
  })
}

/**
 * 渲染模板为 PNG base64（可直接喂给 Format.addImage）
 * @param {string} name 模板名（overview/farm/bag/settings/help）
 * @param {object} data 模板数据
 * @param {{width?:number, scale?:number}} opts
 */
export async function renderCard(name, data = {}, opts = {}) {
  const tplPath = path.join(TPL_DIR, `${name}.html`)
  const tpl = fs.readFileSync(tplPath, 'utf8')
  const theme = fs.readFileSync(THEME, 'utf8')

  let html = art.render(tpl, { ...data, pluResPath: '' })
  html = html.replace(/<link rel="stylesheet" href="farm\/theme\.css"\/>/, `<style>${theme}</style>`)
  html = inlineFileImages(html)

  const browser = await getBrowser()
  const page = await browser.newPage()
  try {
    // 页面宽度由模板 body 宽度决定，先给一个足够宽的视口
    const width = Math.round((opts.width || 700) * 1.8)
    await page.setViewport({ width, height: 100, deviceScaleFactor: 1 })
    await page.setContent(html, { waitUntil: 'load', timeout: 20000 })
    await new Promise(r => setTimeout(r, 120))
    const buf = await page.screenshot({ fullPage: true, type: 'png' })
    return `base64://${Buffer.from(buf).toString('base64')}`
  } finally {
    await page.close().catch(() => {})
  }
}

export async function closeRender() {
  if (G.browser) {
    try { await G.browser.close() } catch { /* ignore */ }
    G.browser = null
  }
}
