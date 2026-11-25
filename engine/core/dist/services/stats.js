"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require('node:path');
const fs = require('node:fs');
const { getSystemDateKey } = require('../utils/utils');
function getStatsFilePath(accountId) {
    const dataDir = process.env.FARM_DATA_DIR || path.join(__dirname, '../../data');
    return path.join(dataDir, 'stats', `${accountId}.json`);
}
function getTodayKey() {
    return getSystemDateKey();
}
function loadPersistedStats(accountId) {
    try {
        const filePath = getStatsFilePath(accountId);
        if (!fs.existsSync(filePath))
            return null;
        const raw = fs.readFileSync(filePath, 'utf8');
        if (!raw || !raw.trim())
            return null;
        return JSON.parse(raw);
    }
    catch {
        return null;
    }
}
function savePersistedStats(accountId, data) {
    try {
        const filePath = getStatsFilePath(accountId);
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        const tmpPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
        fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf8');
        fs.renameSync(tmpPath, filePath);
    }
    catch {
        // ignore
    }
}
const operations = {
    harvest: 0,
    farming: 0,
    fertilize: 0,
    plant: 0,
    steal: 0,
    helpFarming: 0,
    mischief: 0,
    taskClaim: 0,
    sell: 0,
    upgrade: 0,
    levelUp: 0,
    ranchHarvest: 0,
    ranchProduce: 0,
    ranchClean: 0,
    ranchFeed: 0,
    ranchBuy: 0,
    ranchSell: 0,
    ranchTask: 0,
    ranchRelease: 0,
    ranchMischief: 0,
};
const ranchOperations = {
    harvest: 0,
    produce: 0,
    helpFarming: 0,
    steal: 0,
    clean: 0,
    feed: 0,
    buy: 0,
    sell: 0,
    task: 0,
    release: 0,
    mischief: 0,
};
function restoreOperationCounts(target, saved = {}) {
    for (const key of Object.keys(target))
        target[key] = Number(saved?.[key]) || 0;
}
let currentDateKey = null;
const lastState = {
    gold: -1,
    exp: -1,
    coupon: -1,
};
const initialState = {
    gold: null,
    exp: null,
    coupon: null,
};
const session = {
    goldGained: 0,
    expGained: 0,
    couponGained: 0,
    lastExpGain: 0,
    lastGoldGain: 0,
};
let currentAccountId = null;
let sessionStartedAt = Date.now();
let saveTimer = null;
function recordOperation(type, count = 1, scene = 'farm') {
    checkAndResetDailyStats();
    const isRanch = scene === 'ranch' || type.startsWith('ranch');
    if (isRanch) {
        // 本地插件用扁平 key（ranchHarvest/ranchTask...），上游面板用 ranchOperations 对象；
        // 两边同时维护，避免同步后任一侧统计缺失。
        let nested = type.startsWith('ranch') ? type.slice(5) : type;
        nested = nested.charAt(0).toLowerCase() + nested.slice(1);
        const flat = type.startsWith('ranch') ? type : `ranch${type.charAt(0).toUpperCase()}${type.slice(1)}`;
        if (operations[flat] !== undefined)
            operations[flat] += count;
        if (ranchOperations[nested] !== undefined)
            ranchOperations[nested] += count;
        scheduleSave();
        return;
    }
    if (operations[type] !== undefined) {
        operations[type] += count;
        scheduleSave();
    }
}
function checkAndResetDailyStats() {
    if (!currentAccountId)
        return;
    const todayKey = getTodayKey();
    if (currentDateKey && currentDateKey !== todayKey) {
        console.warn(`[统计] 检测到跨天，重置每日统计 (${currentDateKey} -> ${todayKey})`);
        restoreOperationCounts(operations);
        restoreOperationCounts(ranchOperations);
    }
    currentDateKey = todayKey;
}
function scheduleSave() {
    if (!currentAccountId)
        return;
    if (saveTimer)
        return;
    saveTimer = setTimeout(() => {
        saveTimer = null;
        doSave();
    }, 2000);
}
function doSave() {
    if (!currentAccountId)
        return;
    const data = {
        date: currentDateKey ?? getTodayKey(),
        operations: { ...operations },
        ranchOperations: { ...ranchOperations },
        initialState: { ...initialState },
        savedAt: Date.now(),
    };
    savePersistedStats(currentAccountId, data);
}
function initStats(gold, exp, coupon = 0) {
    sessionStartedAt = Date.now();
    const g = Number.isFinite(Number(gold)) ? Number(gold) : 0;
    const e = Number.isFinite(Number(exp)) ? Number(exp) : 0;
    const c = Number.isFinite(Number(coupon)) ? Number(coupon) : 0;
    lastState.gold = g;
    lastState.exp = e;
    lastState.coupon = c;
    initialState.gold = g;
    initialState.exp = e;
    initialState.coupon = c;
}
function initStatsWithPersistence(accountId, gold, exp, coupon = 0) {
    currentAccountId = accountId;
    const todayKey = getTodayKey();
    currentDateKey = todayKey;
    const saved = loadPersistedStats(accountId);
    const isToday = saved?.date === todayKey;
    restoreOperationCounts(operations, isToday ? saved.operations : undefined);
    restoreOperationCounts(ranchOperations, isToday ? saved.ranchOperations : undefined);
    if (isToday) {
        console.warn(`[统计] 已恢复今日统计数据: ${JSON.stringify(saved.operations)}`);
    }
    else if (saved) {
        console.warn(`[统计] 日期已变更，重置统计 (${saved.date} -> ${todayKey})`);
    }
    initStats(gold, exp, coupon);
}
function updateStats(currentGold, currentExp) {
    if (lastState.gold === -1)
        lastState.gold = currentGold;
    if (lastState.exp === -1)
        lastState.exp = currentExp;
    if (currentGold > lastState.gold) {
        const delta = currentGold - lastState.gold;
        session.lastGoldGain = delta;
    }
    else if (currentGold < lastState.gold) {
        session.lastGoldGain = 0;
    }
    lastState.gold = currentGold;
    if (currentExp > lastState.exp) {
        const delta = currentExp - lastState.exp;
        const now = Date.now();
        if (delta === session.lastExpGain && (now - (session.lastExpTime || 0) < 1000)) {
            // console.warn(`[系统] 忽略重复经验增量 +${delta}`);
        }
        else {
            session.lastExpGain = delta;
            session.lastExpTime = now;
            // console.warn(`[系统] 经验 +${delta} (总计: ${currentExp})`);
        }
    }
    else {
        session.lastExpGain = 0;
    }
    lastState.exp = currentExp;
}
function recordGoldExp(gold, exp) {
    updateStats(gold, exp);
}
function setInitialValues(gold, exp, coupon = 0) {
    initStats(gold, exp, coupon);
}
function resetSessionGains() {
    session.goldGained = 0;
    session.expGained = 0;
    session.couponGained = 0;
    session.lastGoldGain = 0;
    session.lastExpGain = 0;
    session.lastExpTime = 0;
}
function recomputeSessionTotals(currentGold, currentExp, currentCoupon) {
    if (initialState.gold === null || initialState.exp === null || initialState.coupon === null) {
        initialState.gold = currentGold;
        initialState.exp = currentExp;
        initialState.coupon = currentCoupon;
    }
    session.goldGained = currentGold - initialState.gold;
    session.expGained = currentExp - initialState.exp;
    session.couponGained = currentCoupon - initialState.coupon;
}
function getStats(statusData, userState, connected, limits) {
    checkAndResetDailyStats();
    const statusObj = (statusData && typeof statusData === 'object') ? statusData : {};
    const userObj = (userState && typeof userState === 'object') ? userState : {};
    const rawGold = userObj.gold ?? statusObj.gold;
    const rawExp = userObj.exp ?? statusObj.exp;
    const rawCoupon = userObj.coupon ?? statusObj.coupon;
    const rawGoldBean = userObj.goldBean ?? statusObj.goldBean;
    const currentGold = Number.isFinite(Number(rawGold)) ? Number(rawGold) : 0;
    const currentExp = Number.isFinite(Number(rawExp)) ? Number(rawExp) : 0;
    const currentCoupon = Number.isFinite(Number(rawCoupon)) ? Number(rawCoupon) : 0;
    const currentGoldBean = Number.isFinite(Number(rawGoldBean)) ? Number(rawGoldBean) : 0;
    if (connected) {
        updateStats(currentGold, currentExp);
        recomputeSessionTotals(currentGold, currentExp, currentCoupon);
    }
    const operationsSnapshot = { ...operations };
    return {
        connection: { connected },
        status: {
            name: userObj.name || statusObj.name,
            level: statusObj.level || userObj.level || 0,
            gold: currentGold,
            coupon: Number.isFinite(Number(userObj.coupon)) ? Number(userObj.coupon) : 0,
            goldBean: currentGoldBean,
            exp: currentExp,
            platform: statusObj.platform || userObj.platform || 'qq',
            avatarUrl: String(userObj.avatarUrl || statusObj.avatarUrl || '').trim(),
        },
        uptime: process.uptime(),
        sessionElapsedSeconds: Math.max(0, (Date.now() - sessionStartedAt) / 1000),
        operations: operationsSnapshot,
        ranchOperations: { ...ranchOperations },
        sessionExpGained: session.expGained,
        sessionGoldGained: session.goldGained,
        sessionCouponGained: session.couponGained,
        lastExpGain: session.lastExpGain,
        lastGoldGain: session.lastGoldGain,
        limits,
    };
}
function saveStats() {
    doSave();
}
module.exports = {
    recordOperation,
    initStats,
    initStatsWithPersistence,
    updateStats,
    setInitialValues,
    recordGoldExp,
    resetSessionGains,
    getStats,
    saveStats,
    getTodayKey,
    loadPersistedStats,
    checkAndResetDailyStats,
};
//# sourceMappingURL=stats.js.map