// 全部绘制：茶馆背景、顾客、点单票、工作站、HUD、漂浮字；标题/暂停/结算见 screens.js。
import {
  W, H, COUNTER_Y, hit, slotCenterX, ticketRect, pauseBtn, muteBtn, brewPanel, toppingPanel, shakePanel,
  baseButtons, toppingButtons, brewSlotRects, toppingInfoRect, shakerRect, handRect, hintRect, rushBanner,
} from './layout.js';
import { BASES, TOPPINGS, baseById, toppingById, matches } from './drinks.js';
import { SHIFT_SECONDS, formatTime } from './timer.js';
import { comboMultiplier } from './orders.js';
import { targetSlot, baseUnlocked } from './stations.js';
import { drawAnimal } from './animals.js';
import { drawTitle, drawPause, drawResults } from './screens.js';
import { rr, fillRR, txt, circle, drawCup, drawStar } from './draw.js';

const INK = '#4a2c1a';
const CREAM = '#fff3dc';

export function render(ctx, state) {
  ctx.clearRect(0, 0, W, H);
  if (state.phase === 'title') { drawTitle(ctx, state); return; }
  drawGame(ctx, state);
  if (state.phase === 'paused') drawPause(ctx, state);
  if (state.phase === 'results') drawResults(ctx, state);
}

function drawGame(ctx, state) {
  drawWall(ctx);
  drawCustomers(ctx, state);
  drawCounter(ctx);
  drawTickets(ctx, state);
  drawBrewStation(ctx, state);
  drawToppingStation(ctx, state);
  drawShakeStation(ctx, state);
  drawHandRow(ctx, state);
  drawHints(ctx);
  if (state.rush) drawRushTint(ctx, state);
  drawHud(ctx, state);
  if (state.rush) drawRushBanner(ctx, state);
  drawFloaters(ctx, state);
}

// 高峰时段：暖橙色调 overlay
function drawRushTint(ctx, state) {
  const pulse = 0.5 + 0.5 * Math.sin(state.time * 3);
  ctx.fillStyle = `rgba(255,150,40,${0.1 + 0.03 * pulse})`;
  ctx.fillRect(0, 56, W, H - 56);
  const g = ctx.createRadialGradient(W / 2, H / 2, 300, W / 2, H / 2, 760);
  g.addColorStop(0, 'rgba(255,120,20,0)');
  g.addColorStop(1, `rgba(255,110,20,${0.18 + 0.06 * pulse})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 56, W, H - 56);
}

// 横幅“高峰时段！”：触发后一直显示到本局结束；刚触发的 2 秒里先放大弹出
function drawRushBanner(ctx, state) {
  const r = rushBanner;
  const g = ctx.createLinearGradient(0, r.y, 0, r.y + r.h);
  g.addColorStop(0, '#ff7a1a');
  g.addColorStop(1, '#e0480f');
  ctx.fillStyle = g;
  ctx.fillRect(r.x, r.y, r.w, r.h);
  ctx.fillStyle = '#ffd36a';
  ctx.fillRect(r.x, r.y + r.h - 2, r.w, 2);
  const nx = Math.round((state.time * 60) % 40);
  ctx.save();
  ctx.beginPath();
  ctx.rect(r.x, r.y, r.w, r.h);
  ctx.clip();
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  for (let x = -40 + nx; x < W; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, r.y + r.h);
    ctx.lineTo(x + 14, r.y);
    ctx.lineTo(x + 28, r.y);
    ctx.lineTo(x + 14, r.y + r.h);
    ctx.fill();
  }
  ctx.restore();
  txt(ctx, '高峰时段！　顾客更多更急　小费 ×1.5', W / 2, r.y + r.h / 2, { size: 17, weight: 'bold', color: '#fff6dc', align: 'center', stroke: '#8a2a0a', sw: 4 });
  if (state.rushAge < 2.2) {
    const k = state.rushAge;
    const pop = k < 0.3 ? 0.6 + (k / 0.3) * 0.5 : 1.1 - Math.min(0.1, (k - 0.3) * 0.2);
    ctx.save();
    ctx.globalAlpha = k > 1.7 ? Math.max(0, (2.2 - k) / 0.5) : 1;
    ctx.translate(W / 2, 228);
    ctx.scale(pop, pop);
    txt(ctx, '高峰时段！', 0, 0, { size: 84, weight: 'bold', color: '#fff6dc', align: 'center', stroke: '#c2410c', sw: 14 });
    ctx.restore();
  }
}

function drawWall(ctx) {
  const g = ctx.createLinearGradient(0, 56, 0, COUNTER_Y);
  g.addColorStop(0, '#f6dfb8');
  g.addColorStop(1, '#e8b985');
  ctx.fillStyle = g;
  ctx.fillRect(0, 56, W, COUNTER_Y - 56);
  ctx.fillStyle = 'rgba(190,120,70,0.13)';
  for (let y = 100; y < COUNTER_Y; y += 44) {
    for (let x = ((y / 44) % 2) * 22; x < W; x += 44) {
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // 门帘
  for (let i = 0; i < 16; i++) {
    const x = i * 80;
    ctx.fillStyle = i % 2 ? '#b8322a' : '#c9422f';
    ctx.beginPath();
    ctx.moveTo(x, 56);
    ctx.lineTo(x + 80, 56);
    ctx.lineTo(x + 80, 76);
    ctx.lineTo(x + 40, 88);
    ctx.lineTo(x, 76);
    ctx.fill();
  }
}

function drawCustomers(ctx, state) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 56, W, COUNTER_Y - 56);
  ctx.clip();
  state.orders.forEach((o, i) => {
    const pop = Math.max(0, 1 - (o.age || 0) / 0.45);
    drawAnimal(ctx, o.animal, slotCenterX(i), 250 + pop * pop * 90, state.time, o.patience / o.maxPatience);
  });
  ctx.restore();
}

function drawCounter(ctx) {
  const g = ctx.createLinearGradient(0, COUNTER_Y, 0, COUNTER_Y + 30);
  g.addColorStop(0, '#9a6236');
  g.addColorStop(1, '#6b3f21');
  ctx.fillStyle = g;
  ctx.fillRect(0, COUNTER_Y, W, 34);
  ctx.fillStyle = '#c28650';
  ctx.fillRect(0, COUNTER_Y, W, 5);
  ctx.fillStyle = '#2f1a0f';
  ctx.fillRect(0, COUNTER_Y + 34, W, H - COUNTER_Y - 34);
}

function patienceColor(r) {
  return `hsl(${Math.round(120 * Math.max(0, Math.min(1, r)))},72%,46%)`;
}

function drawTickets(ctx, state) {
  state.orders.forEach((o, i) => {
    const r = ticketRect(i);
    const ratio = Math.max(0, o.patience / o.maxPatience);
    const ready = !!state.hand && matches(o, state.hand);
    const pulse = 0.5 + 0.5 * Math.sin(state.time * 8);
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;
    const fillColor = ratio < 0.25 && pulse > 0.5 ? '#ffe3dc' : o.vip ? '#fff4c2' : '#fffaf0';
    const edge = ready ? '#ffb300' : o.vip ? '#d9a000' : '#c9a36e';
    fillRR(ctx, r.x, r.y, r.w, r.h, 10, fillColor, edge, ready ? 5 : o.vip ? 4 : 2);
    ctx.restore();
    if (ready) {
      ctx.globalAlpha = 0.4 + 0.4 * pulse;
      fillRR(ctx, r.x - 4, r.y - 4, r.w + 8, r.h + 8, 13, null, '#ffd36a', 4);
      ctx.globalAlpha = 1;
    }
    circle(ctx, r.x + r.w / 2, r.y + 4, 4, '#d9342b');
    const base = baseById(o.base);
    circle(ctx, r.x + 22, r.y + 20, 9, base.color, INK, 2);
    txt(ctx, base.name, r.x + 40, r.y + 20, { size: 21, weight: 'bold', color: INK });
    o.toppings.forEach((id, k) => {
      const t = toppingById(id);
      const x = r.x + 14 + k * 94;
      circle(ctx, x + 7, r.y + 43, 7, t.color, INK, 1.5);
      txt(ctx, t.name, x + 20, r.y + 43, { size: 17, color: INK });
    });
    if (o.vip) {
      fillRR(ctx, r.x + r.w - 52, r.y - 9, 46, 20, 10, '#ffcf1f', '#a8741a', 2);
      txt(ctx, 'VIP', r.x + r.w - 29, r.y + 1, { size: 14, weight: 'bold', color: '#a8321f', align: 'center' });
    }
    fillRR(ctx, r.x + 12, r.y + r.h - 15, r.w - 24, 8, 4, 'rgba(0,0,0,0.15)');
    if (ratio > 0) fillRR(ctx, r.x + 12, r.y + r.h - 15, (r.w - 24) * ratio, 8, 4, patienceColor(ratio));
  });
}

function panel(ctx, r, title) {
  fillRR(ctx, r.x, r.y, r.w, r.h, 16, CREAM, '#a8743f', 3);
  fillRR(ctx, r.x + 14, r.y - 12, 112, 28, 12, '#7b2d1a', '#ffd36a', 2);
  txt(ctx, title, r.x + 70, r.y + 2, { size: 18, weight: 'bold', color: '#ffe9b0', align: 'center' });
}

function padlock(ctx, cx, cy, s = 1) {
  ctx.strokeStyle = '#6f6458';
  ctx.lineWidth = 3 * s;
  ctx.beginPath();
  ctx.arc(cx, cy - 4 * s, 6 * s, Math.PI, 0);
  ctx.stroke();
  fillRR(ctx, cx - 9 * s, cy - 4 * s, 18 * s, 14 * s, 3 * s, '#8a7f72', '#6f6458', 1.5);
  circle(ctx, cx, cy + 3 * s, 2 * s, '#4a4238');
}

function button(ctx, state, r, { label, key, color, enabled = true, active = false, locked = false }) {
  const compact = r.w < 70;
  const hover = (enabled || locked) && hit(r, state.mouse.x, state.mouse.y);
  const dy = hover && !locked ? -2 : 0;
  ctx.globalAlpha = enabled || locked ? 1 : 0.5;
  if (locked) {
    fillRR(ctx, r.x, r.y, r.w, r.h, 12, '#d9d2c7', '#a89d8e', 2);
    padlock(ctx, r.x + r.w / 2, r.y + 30);
    txt(ctx, label, r.x + r.w / 2, r.y + 54, { size: compact ? 17 : 18, weight: 'bold', color: '#8a7f72', align: 'center' });
  } else {
    fillRR(ctx, r.x, r.y + dy, r.w, r.h, 12, hover ? '#fff' : '#fff9ee', active ? '#ff9f1c' : '#a8743f', active ? 4 : 2);
    if (compact) {
      circle(ctx, r.x + r.w / 2, r.y + 32 + dy, 10, color, INK, 2);
      txt(ctx, label, r.x + r.w / 2, r.y + 54 + dy, { size: 17, weight: 'bold', color: INK, align: 'center' });
    } else {
      circle(ctx, r.x + r.w / 2, r.y + 24 + dy, 12, color, INK, 2);
      txt(ctx, label, r.x + r.w / 2, r.y + 49 + dy, { size: 18, weight: 'bold', color: INK, align: 'center' });
    }
  }
  const kw = compact ? 16 : 22;
  const kh = compact ? 16 : 20;
  fillRR(ctx, r.x + 4, r.y + 4 + dy, kw, kh, 5, locked ? '#9a9084' : '#7b2d1a');
  txt(ctx, key.toUpperCase(), r.x + 4 + kw / 2, r.y + 4 + kh / 2 + dy, { size: compact ? 12 : 14, weight: 'bold', color: '#ffe9b0', align: 'center' });
  ctx.globalAlpha = 1;
}

function drawBrewStation(ctx, state) {
  panel(ctx, brewPanel, '冲茶站');
  const can = !state.hand && state.brewSlots.some((s) => !s.cup);
  BASES.forEach((b, i) => {
    const locked = !baseUnlocked(state, i);
    button(ctx, state, baseButtons[i], { label: b.short, key: b.key, color: b.color, enabled: can && !locked, locked });
  });
  const target = targetSlot(state);
  state.brewSlots.forEach((slot, i) => {
    const r = brewSlotRects[i];
    const isTarget = target === slot;
    fillRR(ctx, r.x, r.y, r.w, r.h, 12, '#f3e0bd', isTarget ? '#ff9f1c' : '#c9a36e', isTarget ? 4 : 2);
    if (!slot.cup) {
      txt(ctx, '空闲', r.x + r.w / 2, r.y + r.h / 2 - 6, { size: 20, color: '#b79a76', align: 'center' });
      return;
    }
    const base = baseById(slot.cup.base);
    const cx = r.x + 46;
    const by = r.y + r.h - 24;
    if (!slot.done) {
      ctx.strokeStyle = base.color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx, r.y + 4);
      ctx.lineTo(cx, by - 66 * 0.9 * slot.progress);
      ctx.stroke();
    }
    drawCup(ctx, cx, by, 52, 66, slot.cup, slot.progress);
    txt(ctx, base.name, r.x + 84, r.y + 24, { size: 20, weight: 'bold', color: INK });
    txt(ctx, slot.done ? '已冲好' : `冲泡中 ${Math.floor(slot.progress * 100)}%`, r.x + 84, r.y + 48, { size: 15, color: slot.done ? '#2e8b3d' : '#8a6a4a' });
    slot.cup.toppings.forEach((id, k) => {
      circle(ctx, r.x + 90 + k * 40, r.y + 72, 8, toppingById(id).color, INK, 1.5);
    });
    if (slot.done) {
      ctx.strokeStyle = 'rgba(160,130,100,0.6)';
      ctx.lineWidth = 2;
      for (const dx of [-8, 8]) {
        ctx.beginPath();
        for (let y = 0; y < 22; y += 2) {
          const px = cx + dx + Math.sin(state.time * 3 + y * 0.4 + dx) * 3;
          y ? ctx.lineTo(px, by - 74 - y) : ctx.moveTo(px, by - 74);
        }
        ctx.stroke();
      }
    }
    fillRR(ctx, r.x + 10, r.y + r.h - 14, r.w - 20, 8, 4, 'rgba(0,0,0,0.15)');
    if (slot.progress > 0) fillRR(ctx, r.x + 10, r.y + r.h - 14, (r.w - 20) * slot.progress, 8, 4, base.color);
  });
}

function drawToppingStation(ctx, state) {
  panel(ctx, toppingPanel, '加料站');
  const target = targetSlot(state);
  TOPPINGS.forEach((t, i) => {
    const used = target && target.cup.toppings.includes(t.id);
    const enabled = !!target && !used && target.cup.toppings.length < 2;
    button(ctx, state, toppingButtons[i], { label: t.name, key: t.key, color: t.color, enabled, active: used });
  });
  const r = toppingInfoRect;
  fillRR(ctx, r.x, r.y, r.w, r.h, 12, '#f3e0bd', '#c9a36e', 2);
  if (!target) {
    txt(ctx, '先冲好一杯茶，再来加料', r.x + r.w / 2, r.y + r.h / 2, { size: 20, color: '#a58a68', align: 'center' });
    return;
  }
  drawCup(ctx, r.x + 56, r.y + r.h - 16, 56, 70, target.cup, 1);
  const base = baseById(target.cup.base);
  txt(ctx, `当前杯：${base.name}`, r.x + 110, r.y + 30, { size: 20, weight: 'bold', color: INK });
  const names = target.cup.toppings.map((id) => toppingById(id).name);
  txt(ctx, names.length ? `小料：${names.join(' + ')}` : '小料：还没有', r.x + 110, r.y + 60, { size: 18, color: INK });
  txt(ctx, `${target.cup.toppings.length}/2 种，加完按 S 摇杯`, r.x + 110, r.y + 88, { size: 15, color: '#8a6a4a' });
}

function drawShakeStation(ctx, state) {
  panel(ctx, shakePanel, '摇杯站');
  const sh = state.shaker;
  const r = shakerRect;
  const hover = hit(r, state.mouse.x, state.mouse.y);
  fillRR(ctx, r.x, r.y, r.w, r.h, 12, hover ? '#fff' : '#fff9ee', '#a8743f', 2);
  const shaking = !!sh.cup && !sh.done;
  const sx = r.x + 90;
  const sy = r.y + r.h / 2 + 10;
  ctx.save();
  ctx.translate(sx, sy);
  if (shaking) {
    ctx.translate(Math.sin(state.time * 40) * 4, 0);
    ctx.rotate(Math.sin(state.time * 30) * 0.12);
  }
  const g = ctx.createLinearGradient(-36, 0, 36, 0);
  g.addColorStop(0, '#9aa3ad');
  g.addColorStop(0.45, '#eef2f5');
  g.addColorStop(1, '#8a929c');
  rr(ctx, -34, -50, 68, 100, 10);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = '#59616b';
  ctx.lineWidth = 3;
  ctx.stroke();
  if (sh.cup) {
    const base = baseById(sh.cup.base);
    fillRR(ctx, -20, -30, 40, 60, 6, base.color);
    fillRR(ctx, -20, -30, 40, 60 * (1 - sh.progress), 6, 'rgba(255,255,255,0.45)');
  }
  fillRR(ctx, -28, -70, 56, 22, 8, '#c8ced6', '#59616b', 3);
  fillRR(ctx, -12, -84, 24, 16, 6, '#aab2bb', '#59616b', 3);
  ctx.restore();
  const tx = r.x + 160;
  let msg = '按 S 或点击摇杯';
  if (sh.cup && sh.done) msg = '摇好了，等待取杯';
  else if (shaking) msg = '摇杯中…';
  txt(ctx, msg, tx, r.y + 56, { size: 22, weight: 'bold', color: INK });
  txt(ctx, '先给冲好的杯子加料', tx, r.y + 90, { size: 16, color: '#8a6a4a' });
  txt(ctx, '摇好后自动回到手里', tx, r.y + 114, { size: 16, color: '#8a6a4a' });
  fillRR(ctx, tx, r.y + 150, 190, 14, 7, 'rgba(0,0,0,0.15)');
  if (sh.progress > 0) fillRR(ctx, tx, r.y + 150, 190 * sh.progress, 14, 7, '#4aa3df');
  fillRR(ctx, r.x + 8, r.y + 8, 24, 22, 6, '#7b2d1a');
  txt(ctx, 'S', r.x + 20, r.y + 19, { size: 15, weight: 'bold', color: '#ffe9b0', align: 'center' });
}

function drawHandRow(ctx, state) {
  const r = handRect;
  fillRR(ctx, r.x, r.y, r.w, r.h, 14, CREAM, '#a8743f', 3);
  txt(ctx, '手中饮品', r.x + 20, r.y + r.h / 2, { size: 20, weight: 'bold', color: INK });
  if (state.hand) {
    drawCup(ctx, r.x + 140, r.y + r.h - 8, 34, 44, state.hand, 1);
    const names = [baseById(state.hand.base).name, ...state.hand.toppings.map((id) => toppingById(id).name)];
    txt(ctx, `${names.join(' + ')}（已摇好）`, r.x + 175, r.y + r.h / 2, { size: 22, weight: 'bold', color: '#2e8b3d' });
    txt(ctx, '空格 / 点顾客票出杯　·　点手中杯子或按 X 倒掉', r.x + 520, r.y + r.h / 2, { size: 16, color: '#8a6a4a' });
  } else {
    txt(ctx, '空手（做好一杯后会回到这里）', r.x + 120, r.y + r.h / 2, { size: 18, color: '#a58a68' });
  }
  const t = state.toast;
  if (t) {
    ctx.globalAlpha = Math.min(1, (t.life - t.age) * 2);
    txt(ctx, t.text, r.x + r.w - 20, r.y + r.h / 2, { size: 22, weight: 'bold', color: t.bad ? '#c4261d' : '#2e8b3d', align: 'right' });
    ctx.globalAlpha = 1;
  }
}

function drawHints(ctx) {
  const r = hintRect;
  ctx.fillStyle = '#1c0f08';
  ctx.fillRect(r.x, r.y, r.w, r.h);
  txt(ctx, '1-6 茶底   Q W E R 小料   S 摇杯   空格 出杯   X 倒掉   P 暂停   M 静音   Shift+R 重开本关', W / 2, r.y + r.h / 2, { size: 17, color: '#e8cfa4', align: 'center' });
}

function hudButton(ctx, state, r, label) {
  const hover = hit(r, state.mouse.x, state.mouse.y);
  fillRR(ctx, r.x, r.y, r.w, r.h, 8, hover ? '#7b4a2a' : '#5a3520', '#c28650', 2);
  txt(ctx, label, r.x + r.w / 2, r.y + r.h / 2, { size: 16, weight: 'bold', color: '#ffe9b0', align: 'center' });
}

function drawHud(ctx, state) {
  const g = ctx.createLinearGradient(0, 0, 0, 56);
  g.addColorStop(0, '#3a2012');
  g.addColorStop(1, '#241209');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, 56);
  ctx.fillStyle = '#c28650';
  ctx.fillRect(0, 54, W, 2);
  hudButton(ctx, state, pauseBtn, '暂停');
  hudButton(ctx, state, muteBtn, state.muted ? '静音中' : '声音开');
  const left = Math.max(0, SHIFT_SECONDS - state.clock);
  const item = (x, label, value, color = '#ffe9b0') => {
    txt(ctx, label, x, 28, { size: 16, color: '#c9a77a' });
    txt(ctx, value, x + 52, 28, { size: 26, weight: 'bold', color });
  };
  fillRR(ctx, 172, 11, 84, 34, 17, '#c2410c', '#ffd36a', 2);
  txt(ctx, `第 ${state.level} 关`, 214, 28, { size: 19, weight: 'bold', color: '#fff6dc', align: 'center' });
  item(272, '时间', formatTime(left), left <= 20 ? '#ff6b5a' : '#ffe9b0');
  // 得分 / 目标：带进度条，达标后变金色
  const reached = state.score >= state.target;
  txt(ctx, `得分 ${state.score}`, 410, 20, { size: 21, weight: 'bold', color: reached ? '#ffd36a' : '#ffe9b0' });
  txt(ctx, `目标 ${state.target}`, 700, 20, { size: 16, color: reached ? '#ffd36a' : '#c9a77a', align: 'right' });
  fillRR(ctx, 410, 36, 290, 9, 4.5, 'rgba(255,255,255,0.14)');
  const prog = Math.min(1, state.score / state.target);
  if (prog > 0) fillRR(ctx, 410, 36, Math.max(9, 290 * prog), 9, 4.5, reached ? '#ffcf3f' : '#7fd37a');
  item(722, '金币', String(state.coins), '#ffd36a');
  const mult = comboMultiplier(state.combo);
  item(862, '连击', `×${mult.toFixed(1)}`, state.combo > 0 ? '#ff9f5a' : '#8d7a64');
  if (state.combo > 0) txt(ctx, `${state.combo}连`, 972, 28, { size: 15, color: '#ff9f5a' });
  // 高峰指示：高峰时段内高亮
  const rp = 0.5 + 0.5 * Math.sin(state.time * 6);
  fillRR(ctx, 1030, 14, 66, 28, 14, state.rush ? `rgb(${230 + Math.round(25 * rp)},${90 + Math.round(40 * rp)},20)` : 'rgba(255,255,255,0.08)', state.rush ? '#ffd36a' : '#6d5a46', 2);
  txt(ctx, '高峰', 1063, 28, { size: 16, weight: 'bold', color: state.rush ? '#fff6dc' : '#8d7a64', align: 'center' });
  for (let i = 0; i < 3; i++) drawStar(ctx, 1130 + i * 52, 28, 19, i < state.stars);
}

function drawFloaters(ctx, state) {
  for (const f of state.floaters) {
    const k = f.age / f.life;
    ctx.globalAlpha = Math.max(0, 1 - k * k);
    txt(ctx, f.text, f.x, f.y - k * 50, { size: 32, weight: 'bold', color: f.color, align: 'center', stroke: '#3a2012', sw: 5 });
  }
  ctx.globalAlpha = 1;
}
