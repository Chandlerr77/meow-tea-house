// 游戏状态的创建、重置与通用小工具。
export function createBrewSlot() {
  return { cup: null, progress: 0, done: false, doneSeq: 0 };
}

export function createState(opts = {}) {
  return {
    phase: 'title', // title | playing | paused | results
    muted: !!opts.muted,
    score: 0,
    coins: 0,
    served: 0,
    stars: 3,
    combo: 0,
    bestCombo: 0,
    clock: 0, // 已营业秒数
    orders: [],
    hand: null,
    brewSlots: [createBrewSlot(), createBrewSlot()],
    shaker: { cup: null, progress: 0, done: false },
    selected: -1, // 手动选中的冲泡槽（用于加料/摇杯）
    nextOrderId: 1,
    spawnTimer: 0.8,
    serial: 0,
    floaters: [],
    toast: null,
    endReason: '',
    time: 0, // 真实动画时间
    mouse: { x: -1, y: -1 },
  };
}

// 原地重置（保持 window.__meow 引用不变）
export function resetState(state, phase = 'playing') {
  Object.assign(state, createState({ muted: state.muted }), { phase });
}

export function say(state, text, bad = false) {
  state.toast = { text, bad, age: 0, life: 2 };
}

export function addFloater(state, x, y, text, color = '#ffd36a') {
  state.floaters.push({ x, y, text, color, age: 0, life: 1.3 });
}

export function finishGame(state, reason) {
  if (state.phase === 'results') return;
  state.phase = 'results';
  state.endReason = reason;
  state.coins = Math.floor(state.score / 10);
}
