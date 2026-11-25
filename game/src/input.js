// 鼠标命中 + 键盘输入。
import {
  W, H, hit, baseButtons, toppingButtons, brewSlotRects, shakerRect, handRect, handCupRect, ticketRect,
  pauseBtn, muteBtn, titleStartBtn, levelButtons, resultsButtons, pauseContinueBtn, pauseRestartBtn,
} from './layout.js';
import { MAX_LEVEL } from './levels.js';
import { BASES, TOPPINGS } from './drinks.js';
import { startBrew, addTopping, startShake, selectSlot, discardHand } from './stations.js';
import { serveBest, serveOrder } from './orders.js';
import { resetState, say } from './state.js';
import * as audio from './audio.js';

export function startGame(state, level = state.level) {
  resetState(state, 'playing', level);
  audio.play('click');
}

// 标题画面“开始营业”：最高已解锁关卡
export const highestUnlocked = (state) => Math.min(MAX_LEVEL, state.progress.unlocked);

// 结算画面能否进入下一关
export const canGoNext = (state) => state.won && state.level < MAX_LEVEL;

function toTitle(state) {
  resetState(state, 'title');
}

function toggleMute(state) {
  state.muted = !state.muted;
  audio.setMuted(state.muted);
  audio.play('click');
}

function togglePause(state) {
  if (state.phase === 'playing') state.phase = 'paused';
  else if (state.phase === 'paused') state.phase = 'playing';
}

function handleKey(state, e) {
  const key = e.key;
  const lower = key.length === 1 ? key.toLowerCase() : key;

  if (lower === 'm' && !e.repeat) { toggleMute(state); return true; }
  if (e.shiftKey && lower === 'r' && !e.repeat) {
    startGame(state, state.phase === 'title' ? highestUnlocked(state) : state.level);
    return true;
  }

  if (state.phase === 'title') {
    if ((key === 'Enter' || key === ' ') && !e.repeat) { startGame(state, highestUnlocked(state)); return true; }
    return false;
  }
  if (state.phase === 'results') {
    if ((key === 'Enter' || key === ' ') && !e.repeat) {
      startGame(state, canGoNext(state) ? state.level + 1 : state.level);
      return true;
    }
    return false;
  }
  if (lower === 'p' && !e.repeat) { togglePause(state); return true; }
  if (state.phase !== 'playing') return false;

  const base = BASES.find((b) => b.key === lower);
  if (base) { startBrew(state, base.id); return true; }
  const top = TOPPINGS.find((t) => t.key === lower);
  if (top) { addTopping(state, top.id); return true; }
  if (lower === 's') { startShake(state); return true; }
  if (lower === 'x') { discardHand(state); return true; }
  if (key === ' ' || key === 'Enter') { if (!e.repeat) serveBest(state); return true; }
  return false;
}

function handleClick(state, x, y) {
  audio.unlock();
  if (state.phase === 'title') {
    for (let i = 0; i < levelButtons.length; i++) {
      if (!hit(levelButtons[i], x, y)) continue;
      if (i + 1 <= state.progress.unlocked) startGame(state, i + 1);
      else { say(state, `第 ${i} 关通关后解锁`, true); audio.play('error'); }
      return;
    }
    if (hit(titleStartBtn, x, y)) startGame(state, highestUnlocked(state));
    return;
  }
  if (state.phase === 'results') {
    const b = resultsButtons(canGoNext(state));
    if (b.next && hit(b.next, x, y)) startGame(state, state.level + 1);
    else if (hit(b.again, x, y)) startGame(state, state.level);
    else if (hit(b.title, x, y)) toTitle(state);
    return;
  }
  if (hit(muteBtn, x, y)) { toggleMute(state); return; }
  if (hit(pauseBtn, x, y)) { togglePause(state); return; }
  if (state.phase === 'paused') {
    if (hit(pauseContinueBtn, x, y)) state.phase = 'playing';
    else if (hit(pauseRestartBtn, x, y)) startGame(state, state.level);
    return;
  }
  for (let i = 0; i < BASES.length; i++) {
    if (hit(baseButtons[i], x, y)) { startBrew(state, BASES[i].id); return; }
  }
  for (let i = 0; i < TOPPINGS.length; i++) {
    if (hit(toppingButtons[i], x, y)) { addTopping(state, TOPPINGS[i].id); return; }
  }
  for (let i = 0; i < brewSlotRects.length; i++) {
    if (hit(brewSlotRects[i], x, y)) { selectSlot(state, i); return; }
  }
  if (hit(shakerRect, x, y)) { startShake(state); return; }
  for (let i = 0; i < state.orders.length; i++) {
    if (hit(ticketRect(i), x, y)) { serveOrder(state, state.orders[i].id); return; }
  }
  if (hit(handCupRect, x, y)) { discardHand(state); return; }
  if (hit(handRect, x, y)) serveBest(state);
}

export function initInput(canvas, state) {
  const toCanvas = (e) => {
    const r = canvas.getBoundingClientRect();
    return { x: ((e.clientX - r.left) * W) / r.width, y: ((e.clientY - r.top) * H) / r.height };
  };
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    audio.unlock();
    try {
      if (handleKey(state, e)) e.preventDefault();
    } catch (err) {
      console.error(err);
    }
  });
  canvas.addEventListener('pointerdown', (e) => {
    const p = toCanvas(e);
    state.mouse = p;
    try {
      handleClick(state, p.x, p.y);
    } catch (err) {
      console.error(err);
    }
  });
  canvas.addEventListener('pointermove', (e) => { state.mouse = toCanvas(e); });
  canvas.addEventListener('pointerleave', () => { state.mouse = { x: -1, y: -1 }; });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state.phase === 'playing') state.phase = 'paused';
  });
}
