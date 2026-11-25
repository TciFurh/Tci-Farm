"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 「期望在线」账号列表：记录用户希望哪些账号保持在线。
 * 面板重启后用这份列表自动恢复账号（走持久化的微信凭证免扫码换码）。
 * 用户主动停止账号会把它从列表移除，因此不会被误恢复。
 *
 * 存 data/desired-running.json，形如 { "ids": ["1", "8"] }。
 */
const { getDataFile, ensureDataDir } = require('../../config/runtime-paths');
const { readJsonFileStrict, writeJsonFileAtomic } = require('../../services/json-db');
const DESIRED_FILE = getDataFile('desired-running.json');
function readRaw() {
    try {
        ensureDataDir();
        const data = readJsonFileStrict(DESIRED_FILE, () => ({ ids: [] }));
        const ids = Array.isArray(data?.ids) ? data.ids.map((x) => String(x)).filter(Boolean) : [];
        return { ids: Array.from(new Set(ids)) };
    }
    catch {
        return { ids: [] };
    }
}
function writeRaw(ids) {
    try {
        ensureDataDir();
        writeJsonFileAtomic(DESIRED_FILE, { ids: Array.from(new Set(ids.map(String))) }, 2);
    }
    catch {
        // 持久化失败不影响本次运行
    }
}
/** 首次运行播种：把当前所有账号设为期望在线（文件不存在时） */
function seedIfMissing(accountIds) {
    const fs = require('node:fs');
    if (fs.existsSync(DESIRED_FILE))
        return;
    writeRaw(accountIds);
}
function markRunning(id) {
    const key = String(id || '').trim();
    if (!key)
        return;
    const { ids } = readRaw();
    if (!ids.includes(key))
        writeRaw([...ids, key]);
}
function markStopped(id) {
    const key = String(id || '').trim();
    if (!key)
        return;
    const { ids } = readRaw();
    if (ids.includes(key))
        writeRaw(ids.filter(x => x !== key));
}
function getDesired() {
    return readRaw().ids;
}
module.exports = {
    markRunning,
    markStopped,
    getDesired,
    seedIfMissing,
};
//# sourceMappingURL=desired-running.js.map