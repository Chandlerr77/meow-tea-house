// 摆拍场景：?scene=cover|midplay|serve|rush
import { createState } from './state.js';

function addOrder(s, animal, base, toppings, ratio) {
  const maxPatience = 30;
  s.orders.push({
    id: s.nextOrderId++, animal, base, toppings,
    patience: maxPatience * ratio, maxPatience, age: 5,
  });
}

function playing(clock, score, served, combo) {
  const s = createState();
  s.phase = 'playing';
  s.clock = clock;
  s.score = score;
  s.coins = Math.floor(score / 10);
  s.served = served;
  s.combo = combo;
  s.bestCombo = combo;
  s.spawnTimer = 12;
  return s;
}

export function buildScene(name) {
  switch (name) {
    case 'midplay': {
      const s = playing(52, 340, 3, 3);
      addOrder(s, 'cat', 'black', ['pearl'], 0.85);
      addOrder(s, 'rabbit', 'green', ['pudding'], 0.55);
      addOrder(s, 'panda', 'milk', ['redbean'], 0.3);
      s.brewSlots[0].cup = { base: 'fruit', toppings: [], shaken: false, brewed: false };
      s.brewSlots[0].progress = 0.6;
      s.brewSlots[1].cup = { base: 'milk', toppings: ['redbean'], shaken: false, brewed: true };
      s.brewSlots[1].progress = 1;
      s.brewSlots[1].done = true;
      s.brewSlots[1].doneSeq = ++s.serial;
      return s;
    }
    case 'serve': {
      const s = playing(78, 820, 7, 5);
      addOrder(s, 'cat', 'black', ['pearl'], 0.7);
      addOrder(s, 'dog', 'green', ['pudding'], 0.5);
      addOrder(s, 'fox', 'fruit', ['coconut'], 0.8);
      s.hand = { base: 'black', toppings: ['pearl'], shaken: true, brewed: true };
      return s;
    }
    case 'rush': {
      const s = playing(150, 1980, 16, 5);
      s.stars = 2;
      addOrder(s, 'dog', 'milk', ['pearl', 'pudding'], 0.13);
      addOrder(s, 'fox', 'fruit', ['redbean'], 0.25);
      addOrder(s, 'panda', 'black', ['coconut', 'pearl'], 0.4);
      addOrder(s, 'rabbit', 'green', ['pudding', 'redbean'], 0.3);
      s.brewSlots[0].cup = { base: 'milk', toppings: [], shaken: false, brewed: true };
      s.brewSlots[0].progress = 1;
      s.brewSlots[0].done = true;
      s.brewSlots[0].doneSeq = ++s.serial;
      return s;
    }
    case 'cover':
    default:
      return createState();
  }
}
