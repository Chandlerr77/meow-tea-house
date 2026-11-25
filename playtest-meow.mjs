// Play-test 喵喵茶馆 end-to-end via real keyboard input.
// Loads the game from file://, starts a shift, fulfils the first order through
// the full loop (brew -> toppings -> shake -> serve) and verifies score/coins/served move.
import puppeteer from 'puppeteer';

const BASE_KEY = { black: '1', green: '2', milk: '3', fruit: '4' };
const TOPPING_KEY = { pearl: 'q', pudding: 'w', redbean: 'e', coconut: 'r' };

const browser = await puppeteer.launch({
  headless: true, pipe: true,
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/opt/hatch/bin/hatch-chromium-sandbox',
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--force-device-scale-factor=1', '--allow-file-access-from-files'],
});
const pg = await browser.newPage();
await pg.setViewport({ width: 1280, height: 800 });
const errors = [];
pg.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
pg.on('pageerror', (e) => errors.push(String(e)));
pg.on('requestfailed', (r) => errors.push('REQFAIL ' + r.url()));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const snap = () => pg.evaluate(() => {
  const s = window.__meow;
  if (!s) return null;
  return {
    phase: s.phase, score: s.score, coins: s.coins, served: s.served,
    stars: s.stars, combo: s.combo, clock: Math.round(s.clock * 10) / 10,
    hand: s.hand,
    brewSlots: (s.brewSlots || []).map((b) => ({ cup: b.cup, progress: Math.round(b.progress * 100) / 100, done: b.done })),
    shaker: s.shaker ? { cup: s.shaker.cup, progress: Math.round(s.shaker.progress * 100) / 100, done: s.shaker.done } : null,
    orders: s.orders.map((o) => ({ id: o.id, animal: o.animal, base: o.base, toppings: o.toppings, left: Math.round(o.patience) })),
  };
});

async function waitFor(fn, label, timeoutMs = 30000, stepMs = 250) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    const st = await snap();
    if (st && fn(st)) return st;
    await sleep(stepMs);
  }
  throw new Error('timeout waiting for: ' + label);
}

const url = 'file:///home/hatch/workspace/competitions/meow-tea-house/game/index.html';
await pg.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
await sleep(600);
let st = await snap();
console.log('title phase:', st && st.phase);
if (!st) { console.log('FAIL: window.__meow missing'); await browser.close(); process.exit(1); }

// Start the shift with Space.
await pg.keyboard.press('Space');
await sleep(500);
st = await snap();
console.log('after start phase:', st.phase);

// Wait for the first order to spawn.
st = await waitFor((s) => s.orders.length > 0, 'first order');
const order = st.orders[0];
console.log('first order:', JSON.stringify(order));
const baseKey = BASE_KEY[order.base];
const toppingKeys = order.toppings.map((t) => TOPPING_KEY[t]);
if (!baseKey || toppingKeys.includes(undefined)) {
  console.log('FAIL: unknown base/topping id in order', JSON.stringify(order));
  await browser.close(); process.exit(1);
}

// 1. Brew the tea base.
await pg.keyboard.press(baseKey);
await sleep(400);
st = await snap();
console.log('after brew key: brewSlots=', JSON.stringify(st.brewSlots), 'hand=', JSON.stringify(st.hand));
st = await waitFor((s) => s.brewSlots.some((b) => b.done), 'brew done');
console.log('brew done:', JSON.stringify(st.brewSlots));

// 2. Add toppings one at a time.
for (const tk of toppingKeys) {
  await pg.keyboard.press(tk);
  await sleep(400);
  st = await snap();
  console.log('after topping', tk, ': brewSlots=', JSON.stringify(st.brewSlots), 'hand=', JSON.stringify(st.hand));
}

// 3. Shake.
await pg.keyboard.press('s');
await sleep(400);
st = await snap();
console.log('after shake key: shaker=', JSON.stringify(st.shaker), 'hand=', JSON.stringify(st.hand));
st = await waitFor((s) => s.hand && s.hand.shaken, 'shaken cup in hand', 20000);
console.log('cup in hand:', JSON.stringify(st.hand));

// 4. Serve with Space.
const before = { score: st.score, coins: st.coins, served: st.served };
await pg.keyboard.press('Space');
await sleep(800);
st = await snap();
console.log('after serve: score', before.score, '->', st.score, '| coins', before.coins, '->', st.coins,
  '| served', before.served, '->', st.served, '| phase', st.phase, '| orders left', st.orders.length);

// Also exercise pause/resume.
await pg.keyboard.press('p');
await sleep(300);
st = await snap();
console.log('paused phase:', st.phase);
await pg.keyboard.press('p');
await sleep(300);
st = await snap();
console.log('resumed phase:', st.phase);

const ok = st.score > before.score && st.coins > before.coins && st.served > before.served;
console.log('console errors:', errors.length ? errors : 'none');
console.log(ok ? 'PLAY-TEST PASS: full loop works (brew -> toppings -> shake -> serve, score/coins/served increased)'
  : 'PLAY-TEST FAIL: score/coins/served did not increase');
await browser.close();
process.exit(ok ? 0 : 1);
