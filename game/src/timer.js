// 时间常量与难度（由关卡配置决定）。
export const SHIFT_SECONDS = 180;
export const BREW_SECONDS = 3;
export const SHAKE_SECONDS = 2;

export const RUSH_SPAWN_FACTOR = 0.8;
export const RUSH_TIP_FACTOR = 1.5;

// 难度完全由关卡配置决定（levels.js）；高峰时段只把到达间隔 ×0.6
export function difficulty(cfg, rush = false) {
  return {
    spawnInterval: cfg.spawnInterval * (rush ? RUSH_SPAWN_FACTOR : 1),
    patience: cfg.patience,
    maxOrders: cfg.maxOrders,
  };
}

export function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}
