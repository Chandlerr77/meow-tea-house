// 摆拍场景：?scene=cover|midplay|serve|rush|vip|level10
import { createState } from './state.js';
import { getLevel } from './levels.js';
import { SHIFT_SECONDS } from './timer.js';

function addOrder(s, animal, base, toppings, ratio, vip = false) {
  const maxPatience = vip ? 15 : 30;
  s.orders.push({
    id: s.nextOrderId++, animal, base, toppings, vip,
    patience: maxPatience * ratio, maxPatience, age: 5,
  });
}

function playing(clock, score, served, combo, level = 1) {
  const s = createState({ level });
  s.phase = 'playing';
  s.clock = clock;
  s.score = score;
  s.coins = Math.floor(score / 10);
  s.served = served;
  s.combo = combo;
  s.bestCombo = combo;
  s.spawnTimer = 12;
  // 按关卡配置判断是否已进入高峰时段
  s.rush = clock >= SHIFT_SECONDS - getLevel(level).rushSeconds;
  s.rushAge = 3;
  return s;
}

export function buildScene(name) {
  switch (name) {
    case 'midplay': {
      const s = playing(52, 340, 3, 3);
      addOrder(s, 'cat', 'black', ['pearl'], 0.85);
      addOrder(s, 'rabbit', 'green', ['pudding'], 0.55);
      addOrder(s, 'panda', 'green', ['redbean'], 0.3);
      s.brewSlots[0].cup = { base: 'green', toppings: [], shaken: false, brewed: false };
      s.brewSlots[0].progress = 0.6;
      s.brewSlots[1].cup = { base: 'black', toppings: ['redbean'], shaken: false, brewed: true };
      s.brewSlots[1].progress = 1;
      s.brewSlots[1].done = true;
      s.brewSlots[1].doneSeq = ++s.serial;
      return s;
    }
    case 'serve': {
      const s = playing(78, 820, 7, 5, 3);
      addOrder(s, 'cat', 'black', ['pearl'], 0.7);
      addOrder(s, 'dog', 'green', ['pudding'], 0.5);
      addOrder(s, 'fox', 'fruit', ['coconut'], 0.8);
      s.hand = { base: 'black', toppings: ['pearl'], shaken: true, brewed: true };
      return s;
    }
    case 'vip': {
      const s = playing(70, 900, 8, 4, 5);
      addOrder(s, 'goldcat', 'matcha', ['pearl'], 0.7, true);
      addOrder(s, 'dog', 'black', ['pudding', 'redbean'], 0.6);
      addOrder(s, 'fox', 'fruit', ['coconut'], 0.8);
      return s;
    }
    case 'rush': {
      const s = playing(150, 3000, 16, 5, 5);
      s.stars = 2;
      addOrder(s, 'dog', 'milk', ['pearl', 'pudding'], 0.13);
      addOrder(s, 'goldcat', 'matcha', ['redbean'], 0.55, true);
      addOrder(s, 'panda', 'black', ['coconut', 'pearl'], 0.4);
      addOrder(s, 'rabbit', 'green', ['pudding', 'redbean'], 0.3);
      s.brewSlots[0].cup = { base: 'milk', toppings: [], shaken: false, brewed: true };
      s.brewSlots[0].progress = 1;
      s.brewSlots[0].done = true;
      s.brewSlots[0].doneSeq = ++s.serial;
      return s;
    }
    case 'level10': {
      const s = playing(40, 600, 5, 2, 10);
      addOrder(s, 'cat', 'matcha', ['pearl', 'coconut'], 0.7);
      addOrder(s, 'goldcat', 'fresh', ['pudding'], 0.5, true);
      addOrder(s, 'fox', 'fruit', ['coconut'], 0.4);
      addOrder(s, 'dog', 'milk', ['redbean', 'pearl'], 0.3);
      addOrder(s, 'panda', 'black', ['pudding'], 0.8);
      return s;
    }
    case 'cover':
    default:
      return createState();
  }
}
