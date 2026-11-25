// 画布各区域坐标与命中检测。
export const W = 1280;
export const H = 720;

export const hit = (r, x, y) => !!r && x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;

export const MAX_SLOTS = 5;
export const COUNTER_Y = 322;

export const slotCenterX = (i) => 128 + 256 * i;
export const customerRect = (i) => ({ x: slotCenterX(i) - 110, y: 150, w: 220, h: 170 });
export const ticketRect = (i) => ({ x: slotCenterX(i) - 105, y: 84, w: 210, h: 76 });
export const rushBanner = { x: 0, y: 56, w: W, h: 24 };

export const HUD = { x: 0, y: 0, w: W, h: 56 };
export const pauseBtn = { x: 12, y: 10, w: 70, h: 36 };
export const muteBtn = { x: 90, y: 10, w: 70, h: 36 };

export const brewPanel = { x: 24, y: 356, w: 400, h: 244 };
export const toppingPanel = { x: 440, y: 356, w: 400, h: 244 };
export const shakePanel = { x: 856, y: 356, w: 400, h: 244 };

export const baseButtons = [0, 1, 2, 3, 4, 5].map((i) => ({ x: 40 + i * 62, y: 396, w: 58, h: 66 }));
export const toppingButtons = [0, 1, 2, 3].map((i) => ({ x: 456 + i * 94, y: 396, w: 86, h: 66 }));
export const brewSlotRects = [
  { x: 40, y: 476, w: 180, h: 112 },
  { x: 228, y: 476, w: 180, h: 112 },
];
export const toppingInfoRect = { x: 456, y: 476, w: 368, h: 112 };
export const shakerRect = { x: 872, y: 396, w: 368, h: 192 };

export const handRect = { x: 24, y: 608, w: 1232, h: 62 };
export const handCupRect = { x: 138, y: 612, w: 62, h: 54 }; // 点手里的杯子 = 倒掉
export const hintRect = { x: 0, y: 680, w: W, h: 40 };

// 标题画面：右侧 10 个关卡按钮（5×2）、4 张玩法卡片、开始按钮
export const levelButtons = Array.from({ length: 10 }, (_, i) => ({
  x: 446 + (i % 5) * 160, y: 202 + Math.floor(i / 5) * 90, w: 148, h: 80,
}));
export const tutorialCards = [0, 1, 2, 3].map((i) => ({ x: 446 + i * 201, y: 394, w: 185, h: 126 }));
export const titleStartBtn = { x: 690, y: 542, w: 300, h: 70 };

// 结算画面：按钮数量随结果变化（下一关仅通关且 <10 关时出现）
export function resultsButtons(showNext) {
  const w = 176;
  const gap = 14;
  const keys = showNext ? ['next', 'again', 'title'] : ['again', 'title'];
  const total = keys.length * w + (keys.length - 1) * gap;
  const x0 = (W - total) / 2;
  const out = {};
  keys.forEach((k, i) => { out[k] = { x: x0 + i * (w + gap), y: 568, w, h: 60 }; });
  return out;
}
export const pauseContinueBtn = { x: 380, y: 410, w: 240, h: 60 };
export const pauseRestartBtn = { x: 660, y: 410, w: 240, h: 60 };
