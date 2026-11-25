// 5 种动物顾客的矢量绘制：猫、狗、兔子、熊猫、狐狸。
import { circle, ellipse, poly } from './draw.js';

const OUTLINE = '#4a2c1a';

function face(ctx, cx, cy, mood, o = {}) {
  const { eyeY = cy - 4, spread = 17, white = false } = o;
  for (const s of [-1, 1]) {
    const ex = cx + s * spread;
    if (white) {
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

function drawCat(ctx, cx, cy, mood) {
  body(ctx, cx, cy, '#f0a04b', '#e0475b');
  poly(ctx, [[cx - 44, cy - 10], [cx - 40, cy - 62], [cx - 8, cy - 36]], '#f0a04b', OUTLINE, 2);
  poly(ctx, [[cx + 44, cy - 10], [cx + 40, cy - 62], [cx + 8, cy - 36]], '#f0a04b', OUTLINE, 2);
  poly(ctx, [[cx - 37, cy - 22], [cx - 36, cy - 50], [cx - 18, cy - 35]], '#f7b6b6');
  poly(ctx, [[cx + 37, cy - 22], [cx + 36, cy - 50], [cx + 18, cy - 35]], '#f7b6b6');
  ellipse(ctx, cx, cy, 49, 42, '#f0a04b', 0, OUTLINE, 2);
  ctx.strokeStyle = '#c9772a';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  for (const dx of [-10, 0, 10]) {
    ctx.beginPath();
    ctx.moveTo(cx + dx, cy - 40);
    ctx.lineTo(cx + dx * 0.8, cy - 26);
    ctx.stroke();
  }
  ellipse(ctx, cx, cy + 14, 19, 13, '#fff1d6');
  face(ctx, cx, cy, mood);
  poly(ctx, [[cx - 5, cy + 5], [cx + 5, cy + 5], [cx, cy + 11]], '#e8758a');
  ctx.strokeStyle = '#6a4a38';
  ctx.lineWidth = 1.5;
  for (const s of [-1, 1]) {
    for (const dy of [-3, 4]) {
      ctx.beginPath();
      ctx.moveTo(cx + s * 22, cy + 14 + dy * 0.5);
      ctx.lineTo(cx + s * 52, cy + 12 + dy * 2.5);
      ctx.stroke();
    }
  }
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

const DRAWERS = { cat: drawCat, dog: drawDog, rabbit: drawRabbit, panda: drawPanda, fox: drawFox };

export function moodFor(ratio) {
  return ratio > 0.55 ? 'happy' : ratio > 0.25 ? 'neutral' : 'angry';
}

export function drawAnimal(ctx, kind, cx, cy, t, ratio) {
  const bob = Math.sin(t * 2.2 + cx * 0.01) * 2;
  (DRAWERS[kind] || drawCat)(ctx, cx, cy + bob, moodFor(ratio));
}
