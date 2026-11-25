// 茶底、小料、顾客动物定义与订单生成规则。
export const BASES = [
  { id: 'black', name: '红茶', short: '红茶', key: '1', color: '#b5532a' },
  { id: 'green', name: '绿茶', short: '绿茶', key: '2', color: '#8fbf4d' },
  { id: 'milk', name: '奶茶', short: '奶茶', key: '3', color: '#d9b68c' },
  { id: 'fruit', name: '果茶', short: '果茶', key: '4', color: '#f0745e' },
  { id: 'matcha', name: '抹茶拿铁', short: '抹茶', key: '5', color: '#2f6b3a' },
  { id: 'fresh', name: '鲜果茶', short: '鲜果', key: '6', color: '#ffb703' },
];

export const TOPPINGS = [
  { id: 'pearl', name: '珍珠', key: 'q', color: '#3b2a2a' },
  { id: 'pudding', name: '布丁', key: 'w', color: '#f6d56a' },
  { id: 'redbean', name: '红豆', key: 'e', color: '#9b2f3a' },
  { id: 'coconut', name: '椰果', key: 'r', color: '#f4f1e6' },
];

export const ANIMALS = ['cat', 'dog', 'rabbit', 'panda', 'fox'];

export const baseById = (id) => BASES.find((b) => b.id === id);
export const toppingById = (id) => TOPPINGS.find((t) => t.id === id);

export function sameToppings(a, b) {
  return a.length === b.length && a.every((t) => b.includes(t));
}

// 订单与杯子（hand / cup）是否完全匹配
export function matches(order, cup) {
  return !!cup && order.base === cup.base && sameToppings(order.toppings, cup.toppings);
}

// 1 小料关只出 1 小料订单；2 小料关约 50% 概率出 2 小料订单
export function twoToppingChance(cfg) {
  return cfg.toppings >= 2 ? 0.5 : 0;
}

export function makeOrderSpec(cfg, rand = Math.random) {
  const base = BASES[Math.floor(rand() * Math.min(cfg.bases, BASES.length))].id;
  const count = rand() < twoToppingChance(cfg) ? 2 : 1;
  const pool = TOPPINGS.map((t) => t.id);
  const toppings = [];
  while (toppings.length < count) {
    const pick = pool.splice(Math.floor(rand() * pool.length), 1)[0];
    toppings.push(pick);
  }
  return { base, toppings };
}
