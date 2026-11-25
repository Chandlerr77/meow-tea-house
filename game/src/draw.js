// 通用 Canvas 绘制工具：圆角矩形、文字、星星、杯子。
import { baseById, toppingById } from './drinks.js';

export const FONT = '"PingFang SC","Microsoft YaHei","Noto Sans CJK SC","Noto Sans SC","WenQuanYi Micro Hei",sans-serif';

export function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function fillRR(ctx, x, y, w, h, r, fill, stroke, lw = 2) {
  rr(ctx, x, y, w, h, r);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}

export function txt(ctx, s, x, y, o = {}) {
  const { size = 18, color = '#000', align = 'left', weight = 'normal', stroke, sw = 4 } = o;
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  if (stroke) {
    ctx.lineWidth = sw;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = stroke;
    ctx.strokeText(s, x, y);
  }
  ctx.fillStyle = color;
  ctx.fillText(s, x, y);
}

export function circle(ctx, x, y, r, fill, stroke, lw = 1.5) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}

export function ellipse(ctx, x, y, rx, ry, fill, rot = 0, stroke, lw = 1.5) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}

export function poly(ctx, pts, fill, stroke, lw = 1.5) {
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.stroke(); }
}

export function drawStar(ctx, cx, cy, R, filled) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 ? R * 0.45 : R;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  poly(ctx, pts, filled ? '#ffcf3f' : 'rgba(255,255,255,0.12)', filled ? '#b8860b' : '#7a6a58', 2);
}

// 画一杯饮品：cx 为中心，by 为杯底 y，w/h 为杯口宽与高；level 为液面 0..1
export function drawCup(ctx, cx, by, w, h, cup, level = 1) {
  const top = by - h;
  const bw = w * 0.7;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx - w / 2, top);
  ctx.lineTo(cx + w / 2, top);
  ctx.lineTo(cx + bw / 2, by);
  ctx.lineTo(cx - bw / 2, by);
  ctx.closePath();
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.fill();
  ctx.clip();
  const base = cup && baseById(cup.base);
  if (base && level > 0) {
    const ly = by - h * 0.9 * Math.min(1, level);
    ctx.fillStyle = base.color;
    ctx.fillRect(cx - w / 2, ly, w, by - ly);
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(cx - w / 2, ly, w, 3);
  }
  if (cup) {
    cup.toppings.forEach((id, k) => {
      const t = toppingById(id);
      for (let j = 0; j < 5; j++) {
        const px = cx + (j - 2) * w * 0.14 + (k % 2) * w * 0.05;
        const py = by - w * 0.08 - k * w * 0.15 - (j % 2) * w * 0.05;
        circle(ctx, px, py, w * 0.058, t.color, 'rgba(0,0,0,0.3)', 1);
      }
    });
  }
  ctx.restore();
  ctx.beginPath();
  ctx.moveTo(cx - w / 2, top);
  ctx.lineTo(cx - bw / 2, by);
  ctx.lineTo(cx + bw / 2, by);
  ctx.lineTo(cx + w / 2, top);
  ctx.strokeStyle = 'rgba(90,60,40,0.8)';
  ctx.lineWidth = 2;
  ctx.stroke();
  if (cup && cup.shaken) {
    ctx.beginPath();
    ctx.moveTo(cx + w * 0.08, top - h * 0.28);
    ctx.lineTo(cx - w * 0.02, by - h * 0.15);
    ctx.strokeStyle = '#ff8fb1';
    ctx.lineWidth = Math.max(3, w * 0.07);
    ctx.stroke();
    ellipse(ctx, cx, top, w / 2 + 3, h * 0.1, 'rgba(255,255,255,0.9)', 0, 'rgba(90,60,40,0.8)', 2);
  }
}
