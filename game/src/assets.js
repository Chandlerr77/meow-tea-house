// 本地精灵图（sprite sheet）素材预加载。全部为相对路径，无网络请求。
// 每张图为 10x10 网格，共 100 帧，单帧 240x319，10fps，按行优先排列。
export const catSheets = { wave: null, wait: null, sleep: null };

const COLS = 10;
const FRAMES = 100;
const FW = 240;
const FH = 319;
const FPS = 10;

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.naturalWidth > 0 ? img : null);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export function loadCatSheets() {
  return Promise.all([
    loadImage('./assets/cat-wave-sheet.webp'),
    loadImage('./assets/cat-wait-sheet.webp'),
    loadImage('./assets/cat-sleep-sheet.webp'),
  ]).then(([wave, wait, sleep]) => ({ wave, wait, sleep }));
}

// t 为秒（state.time）；手动按帧绘制，避免 canvas 无法播放动画 GIF 的问题。
export function drawSheetFrame(ctx, sheet, t, dx, dy, dw, dh) {
  if (!sheet) return;
  let f = Math.floor((t * FPS) % FRAMES);
  if (!(f >= 0)) f = 0;
  if (f > FRAMES - 1) f = FRAMES - 1;
  ctx.drawImage(sheet, (f % COLS) * FW, Math.floor(f / COLS) * FH, FW, FH, dx, dy, dw, dh);
}
