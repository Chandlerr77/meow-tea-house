// 关卡表、进度读写、取关卡配置的 helper。难度只由这里的配置决定。
export const MAX_LEVEL = 10;
export const PROGRESS_KEY = 'meow-tea-house-progress-v1';

// bases: 可用茶底数（按 BASES 顺序取前 N 个）；toppings: 订单最多小料数；vip: VIP 概率；rushSeconds: 高峰时长
const raw = [
  [500, 9, 3, 38, 2, 1, 0, 30],
  [800, 8.5, 3, 36, 3, 1, 0, 30],
  [1000, 8, 3, 34, 4, 1, 0, 45],
  [1300, 7.5, 4, 32, 4, 2, 0, 45],
  [1600, 7, 4, 30, 5, 2, 0.08, 60],
  [2000, 6.5, 4, 28, 5, 2, 0.1, 60],
  [2400, 6, 4, 26, 6, 2, 0.12, 60],
  [2800, 5.5, 5, 24, 6, 2, 0.15, 60],
  [3300, 5, 5, 22, 6, 2, 0.18, 60],
  [4000, 5, 5, 22, 6, 2, 0.2, 60],
];

export const LEVELS = raw.map(([target, spawnInterval, maxOrders, patience, bases, toppings, vip, rushSeconds], i) => ({
  level: i + 1, target, spawnInterval, maxOrders, patience, bases, toppings, vip, rushSeconds,
}));

export function clampLevel(n) {
  const v = Math.floor(Number(n));
  if (!Number.isFinite(v)) return 1;
  return Math.max(1, Math.min(MAX_LEVEL, v));
}

export const getLevel = (n) => LEVELS[clampLevel(n) - 1];

// 第 baseIndex 个茶底（0 起）从第几关开始解锁
export function baseUnlockLevel(baseIndex) {
  const hit = LEVELS.find((l) => l.bases > baseIndex);
  return hit ? hit.level : MAX_LEVEL;
}

export function loadProgress() {
  const fresh = { unlocked: 1, best: {} };
  try {
    const p = JSON.parse(localStorage.getItem(PROGRESS_KEY) || 'null');
    if (!p || typeof p !== 'object') return fresh;
    const best = {};
    if (p.best && typeof p.best === 'object') {
      for (const [k, v] of Object.entries(p.best)) if (Number.isFinite(v)) best[k] = v;
    }
    return { unlocked: clampLevel(p.unlocked), best };
  } catch (err) {
    return fresh;
  }
}

export function saveProgress(progress) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify({ unlocked: progress.unlocked, best: progress.best }));
  } catch (err) {
    // 隐私模式等：静默
  }
}

// 记录一局结果，返回 { unlockedNew: 是否新解锁了下一关 }
export function recordResult(progress, level, score, won) {
  const key = String(level);
  if (score > (progress.best[key] || 0)) progress.best[key] = score;
  let unlockedNew = false;
  if (won && level < MAX_LEVEL && progress.unlocked < level + 1) {
    progress.unlocked = level + 1;
    unlockedNew = true;
  }
  saveProgress(progress);
  return { unlockedNew };
}
