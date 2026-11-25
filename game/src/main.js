// 启动、主循环、update + render 调度。
import { createState, finishGame } from './state.js';
import { SHIFT_SECONDS } from './timer.js';
import { updateStations } from './stations.js';
import { updateOrders } from './orders.js';
import { render } from './render.js';
import { initInput } from './input.js';
import { buildScene } from './scenes.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const state = createState();
window.__meow = state;

const sceneName = new URLSearchParams(location.search).get('scene');
if (sceneName) Object.assign(state, buildScene(sceneName));

initInput(canvas, state);

function update(dt) {
  if (state.toast) {
    state.toast.age += dt;
    if (state.toast.age > state.toast.life) state.toast = null;
  }
  if (state.phase !== 'playing') return;
  state.clock += dt;
  updateStations(state, dt);
  updateOrders(state, dt);
  for (const f of state.floaters) f.age += dt;
  state.floaters = state.floaters.filter((f) => f.age < f.life);
  if (state.phase === 'playing' && state.clock >= SHIFT_SECONDS) {
    state.clock = SHIFT_SECONDS;
    finishGame(state, 'time');
  }
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.1, Math.max(0, (now - last) / 1000));
  last = now;
  state.time += dt;
  try {
    update(dt);
  } catch (err) {
    console.error('update error', err);
  }
  try {
    render(ctx, state);
  } catch (err) {
    console.error('render error', err);
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
