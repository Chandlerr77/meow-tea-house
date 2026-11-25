// 顾客生成、耐心衰减、过期扣星、出杯判定与计分。
import { ANIMALS, makeOrderSpec, matches } from './drinks.js';
import { difficulty } from './timer.js';
import { MAX_SLOTS, ticketRect } from './layout.js';
import { addFloater, finishGame, say } from './state.js';
import { fail } from './feedback.js';
import { play } from './audio.js';

export function comboMultiplier(combo) {
  return Math.min(2, 1 + 0.1 * combo);
}

export function spawnOrder(state) {
  const diff = difficulty(state.clock);
  const spec = makeOrderSpec(state.clock);
  const used = state.orders.map((o) => o.animal);
  const free = ANIMALS.filter((a) => !used.includes(a));
  const pool = free.length ? free : ANIMALS;
  const patience = diff.patience + (spec.toppings.length - 1) * 4;
  state.orders.push({
    id: state.nextOrderId++,
    animal: pool[Math.floor(Math.random() * pool.length)],
    base: spec.base,
    toppings: spec.toppings,
    patience,
    maxPatience: patience,
    age: 0,
  });
}

export function updateOrders(state, dt) {
  const diff = difficulty(state.clock);
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
      spawnOrder(state);
      state.spawnTimer = diff.spawnInterval * (0.85 + Math.random() * 0.3);
    } else {
      state.spawnTimer = 1;
    }
  }
}

function deliver(state, order) {
  const index = state.orders.indexOf(order);
  const r = ticketRect(index);
  const tip = Math.floor(Math.max(0, order.patience / order.maxPatience) * 50);
  const mult = comboMultiplier(state.combo);
  const points = Math.round((100 + tip) * mult);
  state.score += points;
  state.coins = Math.floor(state.score / 10);
  state.served += 1;
  state.combo += 1;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  state.hand = null;
  state.orders.splice(index, 1);
  addFloater(state, r.x + r.w / 2, r.y + r.h + 60, `+${points}`);
  if (tip > 0) addFloater(state, r.x + r.w / 2, r.y + r.h + 95, `小费 ${tip}`, '#7fe08a');
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
