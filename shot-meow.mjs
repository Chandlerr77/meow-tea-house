// Screenshot 喵喵茶馆 with puppeteer (sandbox Chromium, file:// + --allow-file-access-from-files).
// Four staged scenes via ?scene=: cover / midplay / serve / rush. Usage: node shot-meow.mjs
import puppeteer from 'puppeteer';
import { statSync } from 'node:fs';
import { join } from 'node:path';

const repo = '/home/hatch/workspace/competitions/meow-tea-house';
const shots = join(repo, 'screenshots');

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

async function shot(scene, file) {
  const url = `file://${repo}/game/index.html?scene=${scene}`;
  await pg.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1500));
  await pg.screenshot({ path: join(shots, file), type: 'png' });
  const s = statSync(join(shots, file));
  console.log(file, s.size, 'bytes');
}

await shot('cover', '1-cover.png');
await shot('midplay', '2-midplay.png');
await shot('serve', '3-serve.png');
await shot('rush', '4-rush.png');
console.log('console errors:', errors.length ? errors : 'none');
await browser.close();
