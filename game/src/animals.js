// 动物顾客的矢量绘制：猫、狗、兔子、熊猫、狐狸，以及 VIP 金色猫。
import { catSheets, drawSheetFrame } from './assets.js';
import { circle, ellipse, poly, fillRR, txt } from './draw.js';

const OUTLINE = '#4a2c1a';

function face(ctx, cx, cy, mood, o = {}) {
  const { eyeY = cy - 4, spread = 17, white = false, green = false } = o;
  for (const s of [-1, 1]) {
    const ex = cx + s * spread;
    if (green) {
      ellipse(ctx, ex, eyeY, 8.5, 10, '#86c232', 0, '#2f2019', 1.8);
      ellipse(ctx, ex, eyeY + 0.5, 4.6, 7.4, '#1b120d');
      circle(ctx, ex - 2.6, eyeY - 3.6, 2.6, '#fff');
    } else if (white) {
      circle(ctx, ex, eyeY, 5.5, '#fff');
      circle(ctx, ex, eyeY, 3, '#111');
    } else {
      circle(ctx, ex, eyeY, 5, '#222');
      circle(ctx, ex - 1.5, eyeY - 1.8, 1.7, '#fff');
    }
    if (mood === 'angry') {
      ctx.beginPath();
      ctx.moveTo(ex - s * 9, eyeY - 12 - 4);
      ctx.lineTo(ex + s * 9, eyeY - 10 + 5);
      ctx.strokeStyle = '#8a1c1c';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  }
  const my = o.mouthY ?? cy + 22;
  ctx.beginPath();
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  if (mood === 'happy') ctx.arc(cx, my - 5, 9, 0.15 * Math.PI, 0.85 * Math.PI);
  else if (mood === 'angry') ctx.arc(cx, my + 8, 8, 1.15 * Math.PI, 1.85 * Math.PI);
  else { ctx.moveTo(cx - 6, my + 2); ctx.lineTo(cx + 6, my + 2); }
  ctx.stroke();
  if (mood === 'angry') {
    // 汗滴
    ellipse(ctx, cx + 44, cy - 20, 4, 6, '#7ec8ff', 0, '#3a8ac8', 1);
  }
}

function body(ctx, cx, cy, color, scarf) {
  ellipse(ctx, cx, cy + 82, 64, 50, color, 0, OUTLINE, 2);
  ellipse(ctx, cx, cy + 44, 34, 9, scarf, 0, OUTLINE, 2);
}

function tabbyPawSmall(ctx, x, y) {
  const rx = 13, ry = 10;
  ellipse(ctx, x, y, rx, ry, '#9a8a76');
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = '#fffaf0';
  ctx.fillRect(x - rx - 1, y + 1, rx * 2 + 2, ry + 2);
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 1.2;
  for (const dx of [-4.5, 4.5]) {
    ctx.beginPath();
    ctx.moveTo(x + dx, y + 3);
    ctx.lineTo(x + dx, y + ry);
    ctx.stroke();
  }
  ctx.strokeStyle = '#4a3a2c';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - rx, y - 4);
  ctx.lineTo(x - 7, y - 3);
  ctx.moveTo(x + rx, y - 4);
  ctx.lineTo(x + 7, y - 3);
  ctx.stroke();
  ctx.restore();
  ellipse(ctx, x, y, rx, ry, null, 0, OUTLINE, 2);
}

function drawCat(ctx, cx, cy, mood) {
  const FUR = '#9a8a76', DARK = '#4a3a2c';
  // 紧凑小身体（头明显更大）
  ellipse(ctx, cx, cy + 62, 42, 34, FUR, 0, OUTLINE, 2);
  ctx.lineJoin = 'round';
  poly(ctx, [[cx - 54, cy - 6], [cx - 44, cy - 68], [cx - 12, cy - 42]], FUR, OUTLINE, 2);
  poly(ctx, [[cx + 54, cy - 6], [cx + 44, cy - 68], [cx + 12, cy - 42]], FUR, OUTLINE, 2);
  poly(ctx, [[cx - 46, cy - 18], [cx - 43, cy - 54], [cx - 24, cy - 38]], '#e8a09a');
  poly(ctx, [[cx + 46, cy - 18], [cx + 43, cy - 54], [cx + 24, cy - 38]], '#e8a09a');
  ellipse(ctx, cx, cy, 56, 48, FUR, 0, OUTLINE, 2);
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx, cy, 55, 47, 0, 0, Math.PI * 2);
  ctx.clip();
  ctx.strokeStyle = DARK;
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  for (const [dx, len] of [[-10, 11], [0, 15], [10, 11]]) {
    ctx.beginPath();
    ctx.moveTo(cx + dx, cy - 48);
    ctx.lineTo(cx + dx * 0.9, cy - 48 + len);
    ctx.stroke();
  }
  for (const s of [-1, 1]) {
    for (const dy of [12, 22]) {
      ctx.beginPath();
      ctx.moveTo(cx + s * 58, cy + dy);
      ctx.lineTo(cx + s * 44, cy + dy + 2);
      ctx.stroke();
    }
  }
  ctx.restore();
  ellipse(ctx, cx, cy + 17, 16, 10, '#c2a878');
  ellipse(ctx, cx, cy + 32, 6.5, 3.5, '#fffaf0');
  face(ctx, cx, cy, mood, { green: true, eyeY: cy + 1, spread: 22 });
  poly(ctx, [[cx - 4, cy + 9], [cx + 4, cy + 9], [cx, cy + 14]], '#d97a6a');
  ctx.strokeStyle = '#fffaf0';
  ctx.lineWidth = 1.5;
  for (const s of [-1, 1]) {
    for (const dy of [-3, 4]) {
      ctx.beginPath();
      ctx.moveTo(cx + s * 24, cy + 16 + dy * 0.5);
      ctx.lineTo(cx + s * 56, cy + 14 + dy * 2.5);
      ctx.stroke();
    }
  }
  ctx.lineJoin = 'miter';
  ellipse(ctx, cx, cy + 47, 30, 8, '#e0475b', 0, OUTLINE, 2);
  // 前爪：圆而大，白趾尖；(cx±22, cy+58) 在柜台裁剪线之上
  tabbyPawSmall(ctx, cx - 22, cy + 58);
  tabbyPawSmall(ctx, cx + 22, cy + 58);
}

function drawDog(ctx, cx, cy, mood) {
  body(ctx, cx, cy, '#c68b59', '#3b82c4');
  for (const s of [-1, 1]) ellipse(ctx, cx + s * 47, cy - 2, 16, 32, '#7a4a2a', s * 0.25, OUTLINE, 2);
  ellipse(ctx, cx, cy, 47, 42, '#c68b59', 0, OUTLINE, 2);
  circle(ctx, cx + 17, cy - 5, 15, '#7a4a2a');
  ellipse(ctx, cx, cy + 15, 25, 19, '#f3dcbc', 0, OUTLINE, 1.5);
  face(ctx, cx, cy, mood, { mouthY: cy + 28 });
  ellipse(ctx, cx, cy + 8, 8, 5.5, '#222');
  if (mood === 'happy') ellipse(ctx, cx, cy + 31, 5, 7, '#ff7a8a');
}

function drawRabbit(ctx, cx, cy, mood) {
  body(ctx, cx, cy, '#f6f1ee', '#e07aa0');
  for (const s of [-1, 1]) {
    ellipse(ctx, cx + s * 20, cy - 62, 12, 28, '#f6f1ee', s * 0.12, OUTLINE, 2);
    ellipse(ctx, cx + s * 20, cy - 60, 6, 21, '#f4a9b8', s * 0.12);
  }
  ellipse(ctx, cx, cy, 45, 41, '#f6f1ee', 0, OUTLINE, 2);
  for (const s of [-1, 1]) circle(ctx, cx + s * 30, cy + 14, 8, 'rgba(244,140,160,0.55)');
  face(ctx, cx, cy, mood, { spread: 16 });
  poly(ctx, [[cx - 4, cy + 7], [cx + 4, cy + 7], [cx, cy + 13]], '#f08aa5');
  if (mood === 'happy') {
    ctx.fillStyle = '#fff';
    ctx.fillRect(cx - 5, cy + 22, 4.5, 7);
    ctx.fillRect(cx + 0.5, cy + 22, 4.5, 7);
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 1;
    ctx.strokeRect(cx - 5, cy + 22, 4.5, 7);
    ctx.strokeRect(cx + 0.5, cy + 22, 4.5, 7);
  }
}

function drawPanda(ctx, cx, cy, mood) {
  body(ctx, cx, cy, '#ffffff', '#d9342b');
  ellipse(ctx, cx - 56, cy + 78, 16, 34, '#2b2b2b', 0.4);
  ellipse(ctx, cx + 56, cy + 78, 16, 34, '#2b2b2b', -0.4);
  for (const s of [-1, 1]) circle(ctx, cx + s * 37, cy - 34, 16, '#2b2b2b');
  ellipse(ctx, cx, cy, 50, 43, '#ffffff', 0, OUTLINE, 2);
  for (const s of [-1, 1]) ellipse(ctx, cx + s * 18, cy - 4, 12, 16, '#2b2b2b', s * 0.5);
  face(ctx, cx, cy, mood === 'angry' ? 'angry' : mood, { white: true, spread: 18 });
  ellipse(ctx, cx, cy + 12, 7, 5, '#222');
}

function drawFox(ctx, cx, cy, mood) {
  body(ctx, cx, cy, '#e8672a', '#f6e7c8');
  poly(ctx, [[cx - 46, cy - 8], [cx - 44, cy - 72], [cx - 8, cy - 36]], '#e8672a', OUTLINE, 2);
  poly(ctx, [[cx + 46, cy - 8], [cx + 44, cy - 72], [cx + 8, cy - 36]], '#e8672a', OUTLINE, 2);
  poly(ctx, [[cx - 44, cy - 72], [cx - 40, cy - 52], [cx - 28, cy - 58]], '#3a2318');
  poly(ctx, [[cx + 44, cy - 72], [cx + 40, cy - 52], [cx + 28, cy - 58]], '#3a2318');
  ellipse(ctx, cx, cy, 50, 41, '#e8672a', 0, OUTLINE, 2);
  poly(ctx, [[cx - 49, cy + 4], [cx - 22, cy + 6], [cx, cy + 36], [cx + 22, cy + 6], [cx + 49, cy + 4], [cx + 30, cy + 30], [cx, cy + 40], [cx - 30, cy + 30]], '#fff6ea');
  face(ctx, cx, cy, mood, { mouthY: cy + 25 });
  ellipse(ctx, cx, cy + 10, 6, 4.5, '#222');
}

// VIP 金色猫：金毛 + 皇冠 + 胸前 VIP 徽章
function drawGoldcat(ctx, cx, cy, mood) {
  const GOLD = '#ffd24a';
  const DEEP = '#d9a21b';
  body(ctx, cx, cy, GOLD, '#8e2bd0');
  // 胸前徽章
  fillRR(ctx, cx - 25, cy + 66, 50, 22, 11, '#fff3b0', '#b8860b', 2);
  txt(ctx, 'VIP', cx, cy + 77, { size: 15, weight: 'bold', color: '#a8321f', align: 'center' });
  poly(ctx, [[cx - 44, cy - 10], [cx - 40, cy - 62], [cx - 8, cy - 36]], GOLD, OUTLINE, 2);
  poly(ctx, [[cx + 44, cy - 10], [cx + 40, cy - 62], [cx + 8, cy - 36]], GOLD, OUTLINE, 2);
  poly(ctx, [[cx - 37, cy - 22], [cx - 36, cy - 50], [cx - 18, cy - 35]], '#f7b6b6');
  poly(ctx, [[cx + 37, cy - 22], [cx + 36, cy - 50], [cx + 18, cy - 35]], '#f7b6b6');
  ellipse(ctx, cx, cy, 49, 42, GOLD, 0, OUTLINE, 2);
  ctx.strokeStyle = DEEP;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  for (const dx of [-14, 14]) {
    ctx.beginPath();
    ctx.moveTo(cx + dx, cy - 12);
    ctx.lineTo(cx + dx * 1.25, cy - 2);
    ctx.stroke();
  }
  ellipse(ctx, cx, cy + 14, 19, 13, '#fff8dc');
  face(ctx, cx, cy, mood);
  poly(ctx, [[cx - 5, cy + 5], [cx + 5, cy + 5], [cx, cy + 11]], '#e8758a');
  ctx.strokeStyle = '#7a5a2a';
  ctx.lineWidth = 1.5;
  for (const s of [-1, 1]) {
    for (const dy of [-3, 4]) {
      ctx.beginPath();
      ctx.moveTo(cx + s * 22, cy + 14 + dy * 0.5);
      ctx.lineTo(cx + s * 52, cy + 12 + dy * 2.5);
      ctx.stroke();
    }
  }
  // 皇冠
  poly(ctx, [[cx - 24, cy - 38], [cx - 28, cy - 70], [cx - 12, cy - 55], [cx, cy - 76], [cx + 12, cy - 55], [cx + 28, cy - 70], [cx + 24, cy - 38]], '#ffcf1f', '#a8741a', 2.5);
  fillRR(ctx, cx - 25, cy - 44, 50, 9, 3, '#e0a800', '#a8741a', 2);
  circle(ctx, cx - 28, cy - 71, 4, '#ff5a6a', '#a8741a', 1.5);
  circle(ctx, cx, cy - 77, 4.5, '#5ad0ff', '#a8741a', 1.5);
  circle(ctx, cx + 28, cy - 71, 4, '#ff5a6a', '#a8741a', 1.5);
  circle(ctx, cx, cy - 40, 3, '#fff', '#a8741a', 1);
}

const DRAWERS = { cat: drawCat, dog: drawDog, rabbit: drawRabbit, panda: drawPanda, fox: drawFox, goldcat: drawGoldcat };

export function moodFor(ratio) {
  return ratio > 0.55 ? 'happy' : ratio > 0.25 ? 'neutral' : 'angry';
}

export function drawAnimal(ctx, kind, cx, cy, t, ratio) {
  const bob = Math.sin(t * 2.2 + cx * 0.01) * 2;
  if (kind === 'cat' && catSheets.wait) {
    drawSheetFrame(ctx, catSheets.wait, t, cx - 62, cy - 68 + bob, 124, 164);
    return;
  }
  (DRAWERS[kind] || drawCat)(ctx, cx, cy + bob, moodFor(ratio));
}
