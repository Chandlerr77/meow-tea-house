// Verify the X discard: brew a cup, shake it, press X, hand must be empty again
// and a new brew must be possible (no soft-lock from a wrong cup).
import puppeteer from 'puppeteer';

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
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const snap = () => pg.evaluate(() => {
  const s = window.__meow;
  return { phase: s.phase, hand: s.hand, brew: s.brewSlots.map((b) => ({ cup: !!b.cup, done: b.done })) };
});

await pg.goto('file:///home/hatch/workspace/competitions/meow-tea-house/game/index.html', { waitUntil: 'networkidle0', timeout: 30000 });
await sleep(500);
await pg.keyboard.press('Space');
await sleep(500);
// Brew a deliberately wrong cup (fruit tea, no order check) and shake it.
await pg.keyboard.press('4');
await sleep(3800);
await pg.keyboard.press('s');
await sleep(2800);
let st = await snap();
console.log('hand before discard:', JSON.stringify(st.hand));
if (!st.hand || !st.hand.shaken) { console.log('FAIL: no shaken cup in hand to discard'); await browser.close(); process.exit(1); }
await pg.keyboard.press('x');
await sleep(400);
st = await snap();
console.log('hand after X:', JSON.stringify(st.hand));
// Brewing again must work now.
await pg.keyboard.press('1');
await sleep(400);
st = await snap();
console.log('brew slots after re-brew:', JSON.stringify(st.brew));
const ok = st.hand === null && st.brew[0].cup === true && errors.length === 0;
console.log('console errors:', errors.length ? errors : 'none');
console.log(ok ? 'DISCARD CHECK PASS' : 'DISCARD CHECK FAIL');
await browser.close();
process.exit(ok ? 0 : 1);
