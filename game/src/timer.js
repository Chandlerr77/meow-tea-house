// 时间与难度曲线：难度只随速度提升。
export const SHIFT_SECONDS = 180;
export const BREW_SECONDS = 3;
export const SHAKE_SECONDS = 2;

const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (v) => Math.max(0, Math.min(1, v));

export function difficulty(elapsed) {
  const t = clamp01(elapsed / SHIFT_SECONDS);
  return {
    spawnInterval: lerp(9, 5, t),
    patience: lerp(36, 22, t),
    maxOrders: elapsed >= 60 ? 4 : 3,
  };
}

export function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}
