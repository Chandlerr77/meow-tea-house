// 顾客生成、耐心衰减、过期扣星、出杯判定与计分；VIP 与高峰时段规则。
import { ANIMALS, makeOrderSpec, matches } from './drinks.js';
import { difficulty, SHIFT_SECONDS, RUSH_TIP_FACTOR } from './timer.js';
import { MAX_SLOTS, ticketRect } from './layout.js';
import { addFloater, finishGame, say } from './state.js';
import { fail } from './feedback.js';
import { play } from './audio.js';

export const VIP_ANIMAL = 'goldcat';
export const VIP_TIP_FACTOR = 2;
export const VIP_PATIENCE_FACTOR = 0.5;

export function comboMultiplier(combo) {
  return Math.min(2, 1 + 0.1 * combo);
}

// 高峰时段：clock 进入最后 rushSeconds 秒时触发一次，直到本局结束
export function updateRush(state, dt = 0) {
  if (state.rush) { state.rushAge += dt; return; }
  if (state.clock >= SHIFT_SECONDS - state.levelCfg.rushSeconds) {
    state.rush = true;
    state.rushAge = 0;
    play('rush');
  }
}

export function spawnOrder(state, rand = Math.random) {
  const cfg = state.levelCfg;
  const diff = difficulty(cfg, state.rush);
  const spec = makeOrderSpec(cfg, rand);
  const vip = cfg.vip > 0 && !state.orders.some((o) => o.vip) && rand() < cfg.vip;
  const used = state.orders.map((o) => o.animal);
  const free = ANIMALS.filter((a) => !used.includes(a));
  const pool = free.length ? free : ANIMALS;
  let patience = diff.patience + (spec.toppings.length - 1) * 4;
  if (vip) patience *= VIP_PATIENCE_FACTOR;
  state.orders.push({
    id: state.nextOrderId++,
    animal: vip ? VIP_ANIMAL : pool[Math.floor(rand() * pool.length)],
    vip,
    base: spec.base,
    toppings: spec.toppings,
    patience,
    maxPatience: patience,
    age: 0,
  });
}

export function updateOrders(state, dt, rand = Math.random) {
  const diff = difficulty(state.levelCfg, state.rush);
  for (const o of state.orders) {
    o.age = (o.age || 0) + dt;
    o.patience -= dt;
  }
  // 过期订单：扣星、清连击
  for (const o of state.orders.filter((x) => x.patience <= 0)) {
    state.orders.splice(state.orders.indexOf(o), 1);
    state.stars -= 1;
    state.combo = 0;
    say(state, '有顾客等不及走了！', true);
    play('error');
    if (state.stars <= 0) {
      state.stars = 0;
      finishGame(state, 'stars');
      return;
    }
  }
  // 到达间隔
  state.spawnTimer -= dt;
  if (state.orders.length === 0 && state.spawnTimer > 1.5) state.spawnTimer = 1.5;
  if (state.spawnTimer <= 0) {
    if (state.orders.length < Math.min(diff.maxOrders, MAX_SLOTS)) {
      spawnOrder(state, rand);
      state.spawnTimer = diff.spawnInterval * (0.85 + rand() * 0.3);
    } else {
      state.spawnTimer = 1;
    }
  }
}

function deliver(state, order) {
  const index = state.orders.indexOf(order);
  const r = ticketRect(index);
  const ratio = Math.max(0, order.patience / order.maxPatience);
  // 小费：耐心比例 ×50；VIP ×2、高峰 ×1.5，可叠乘
  const tipFactor = (order.vip ? VIP_TIP_FACTOR : 1) * (state.rush ? RUSH_TIP_FACTOR : 1);
  const tip = Math.floor(ratio * 50 * tipFactor);
  const mult = comboMultiplier(state.combo);
  const points = Math.round((100 + tip) * mult);
  state.lastServe = { points, tip, ratio, tipFactor, mult, vip: !!order.vip, rush: state.rush };
  state.score += points;
  state.coins = Math.floor(state.score / 10);
  state.served += 1;
  state.combo += 1;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  state.hand = null;
  state.orders.splice(index, 1);
  const cx = r.x + r.w / 2;
  if (order.vip) {
    addFloater(state, cx, r.y + r.h + 60, `VIP +${points}`, '#ffe03a');
    if (tip > 0) addFloater(state, cx, r.y + r.h + 95, `小费 ${tip}`, '#ffc400');
  } else {
    addFloater(state, cx, r.y + r.h + 60, `+${points}`);
    if (tip > 0) addFloater(state, cx, r.y + r.h + 95, `小费 ${tip}`, '#7fe08a');
  }
  play('coin');
  play('ding');
}

function missed(state, msg) {
  state.combo = 0;
  return fail(state, msg);
}

// 空格：送给耐心最高的匹配顾客
export function serveBest(state) {
  if (!state.hand || !state.hand.shaken) return fail(state, '手里没有成品饮品');
  let best = null;
  for (const o of state.orders) {
    if (matches(o, state.hand) && (!best || o.patience > best.patience)) best = o;
  }
  if (!best) return missed(state, '没有顾客点这杯！');
  deliver(state, best);
  return { ok: true };
}

// 点击点单票：送给指定顾客
export function serveOrder(state, orderId) {
  if (!state.hand || !state.hand.shaken) return fail(state, '手里没有成品饮品');
  const order = state.orders.find((o) => o.id === orderId);
  if (!order) return { ok: false };
  if (!matches(order, state.hand)) return missed(state, '这不是 TA 点的饮品！');
  deliver(state, order);
  return { ok: true };
}
