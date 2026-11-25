// 标题、暂停、结算画面。
import {
  W, H, hit, titleStartBtn, resultsAgainBtn, resultsTitleBtn, pauseContinueBtn, pauseRestartBtn,
} from './layout.js';
import { fillRR, txt, circle, ellipse, poly, drawStar } from './draw.js';

const INK = '#4a2c1a';

function bigButton(ctx, state, r, label, hint) {
  const hover = hit(r, state.mouse.x, state.mouse.y);
  const pulse = 1 + Math.sin(state.time * 4) * 0.015;
  ctx.save();
  ctx.translate(r.x + r.w / 2, r.y + r.h / 2);
  ctx.scale(hover ? 1.05 : pulse, hover ? 1.05 : pulse);
  ctx.translate(-r.w / 2, -r.h / 2);
  fillRR(ctx, 0, 0, r.w, r.h, 18, hover ? '#ff5a45' : '#e0392b', '#ffd36a', 4);
  txt(ctx, label, r.w / 2, r.h / 2 - (hint ? 7 : 0), { size: 30, weight: 'bold', color: '#fff6dc', align: 'center' });
  if (hint) txt(ctx, hint, r.w / 2, r.h / 2 + 20, { size: 14, color: '#ffe3b0', align: 'center' });
  ctx.restore();
}

function lantern(ctx, x, y, t) {
  const sway = Math.sin(t * 1.5 + x) * 4;
  ctx.strokeStyle = '#6b3f21';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, 0);
  ctx.lineTo(x + sway, y - 40);
  ctx.stroke();
  ellipse(ctx, x + sway, y, 34, 42, '#d9342b', 0, '#ffd36a', 3);
  ctx.strokeStyle = 'rgba(255,211,106,0.5)';
  ctx.lineWidth = 2;
  for (const k of [-14, 0, 14]) {
    ctx.beginPath();
    ctx.ellipse(x + sway, y, Math.abs(k) + 2, 42, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  txt(ctx, '茶', x + sway, y, { size: 30, weight: 'bold', color: '#ffe9b0', align: 'center' });
  fillRR(ctx, x + sway - 10, y + 40, 20, 8, 3, '#ffd36a');
}

function manekiNeko(ctx, cx, cy, t) {
  // 身体
  ellipse(ctx, cx, cy + 150, 104, 120, '#fffaf0', 0, '#d3bfa0', 3);
  // 放下的前爪与金币
  ellipse(ctx, cx - 62, cy + 150, 24, 52, '#fffaf0', 0.25, '#d3bfa0', 3);
  ellipse(ctx, cx - 28, cy + 188, 36, 44, '#ffcf3f', 0, '#b8860b', 4);
  ellipse(ctx, cx - 28, cy + 188, 26, 34, null, 0, '#b8860b', 2);
  txt(ctx, '福', cx - 28, cy + 188, { size: 32, weight: 'bold', color: '#b8321f', align: 'center' });
  // 招手的爪
  ctx.save();
  ctx.translate(cx + 78, cy + 110);
  ctx.rotate(-0.35 + Math.sin(t * 3.2) * 0.28);
  ellipse(ctx, 0, -55, 26, 60, '#fffaf0', 0, '#d3bfa0', 3);
  circle(ctx, 0, -100, 9, '#f6a8b4');
  for (const dx of [-8, 0, 8]) circle(ctx, dx, -80 + Math.abs(dx) * 0.4, 4, '#f6a8b4');
  ctx.restore();
  // 耳朵
  poly(ctx, [[cx - 92, cy + 5], [cx - 84, cy - 70], [cx - 28, cy - 38]], '#fffaf0', '#d3bfa0', 3);
  poly(ctx, [[cx + 92, cy + 5], [cx + 84, cy - 70], [cx + 28, cy - 38]], '#fffaf0', '#d3bfa0', 3);
  poly(ctx, [[cx - 80, cy - 8], [cx - 77, cy - 52], [cx - 46, cy - 34]], '#f6a8b4');
  poly(ctx, [[cx + 80, cy - 8], [cx + 77, cy - 52], [cx + 46, cy - 34]], '#f6a8b4');
  // 头
  ellipse(ctx, cx, cy + 20, 108, 86, '#fffaf0', 0, '#d3bfa0', 3);
  ellipse(ctx, cx - 52, cy - 26, 34, 22, '#f0a04b', -0.4);
  ellipse(ctx, cx + 58, cy - 22, 28, 20, '#3a3a3a', 0.4);
  // 脸
  ctx.strokeStyle = '#3a2a22';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(cx + s * 42, cy + 24, 15, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
    circle(ctx, cx + s * 66, cy + 52, 13, 'rgba(244,140,160,0.6)');
  }
  poly(ctx, [[cx - 7, cy + 38], [cx + 7, cy + 38], [cx, cy + 47]], '#e8758a');
  ctx.beginPath();
  ctx.arc(cx - 8, cy + 48, 8, 0.1 * Math.PI, 0.9 * Math.PI);
  ctx.arc(cx + 8, cy + 48, 8, 0.1 * Math.PI, 0.9 * Math.PI);
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#8a7a6a';
  for (const s of [-1, 1]) {
    for (const dy of [-6, 4, 14]) {
      ctx.beginPath();
      ctx.moveTo(cx + s * 70, cy + 46 + dy * 0.4);
      ctx.lineTo(cx + s * 112, cy + 44 + dy);
      ctx.stroke();
    }
  }
  // 项圈与铃铛
  ellipse(ctx, cx, cy + 100, 84, 18, '#d9342b', 0, '#8a1c1c', 3);
  circle(ctx, cx, cy + 124, 16, '#ffcf3f', '#b8860b', 3);
  ctx.fillStyle = '#b8860b';
  ctx.fillRect(cx - 9, cy + 124, 18, 3);
}

export function drawTitle(ctx, state) {
  const t = state.time;
  const g = ctx.createRadialGradient(W / 2, H * 0.45, 80, W / 2, H / 2, 800);
  g.addColorStop(0, '#5a2e18');
  g.addColorStop(1, '#190b06');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 28; i++) {
    const x = (i * 197) % W;
    const y = H - ((i * 83 + t * (12 + (i % 5) * 4)) % H);
    ctx.globalAlpha = 0.12 + (i % 4) * 0.04;
    circle(ctx, x, y, 6 + (i % 5) * 3, '#ffcf8a');
  }
  ctx.globalAlpha = 1;
  lantern(ctx, 150, 90, t);
  lantern(ctx, W - 150, 90, t + 1);
  // 招牌
  ctx.strokeStyle = '#6b3f21';
  ctx.lineWidth = 4;
  for (const x of [420, 860]) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 34);
    ctx.stroke();
  }
  fillRR(ctx, 330, 30, 620, 120, 18, '#7b2d1a', '#ffd36a', 6);
  fillRR(ctx, 344, 44, 592, 92, 12, null, 'rgba(255,211,106,0.45)', 2);
  txt(ctx, '喵喵茶馆', W / 2, 90, { size: 76, weight: 'bold', color: '#ffd36a', align: 'center', stroke: '#3a1408', sw: 8 });
  txt(ctx, '猫咪店长的珍珠奶茶时间管理游戏', W / 2, 188, { size: 26, color: '#ffe9b0', align: 'center' });

  manekiNeko(ctx, 250, 250, t);

  // 玩法说明
  fillRR(ctx, 500, 214, 740, 350, 18, 'rgba(255,243,220,0.96)', '#c28650', 4);
  const line = (s, y, o = {}) => txt(ctx, s, 530, y, { size: 20, color: INK, ...o });
  line('玩法流程', 246, { size: 24, weight: 'bold', color: '#b8321f' });
  line('① 冲茶站：选茶底，冲泡约 3 秒（有两个冲泡槽）', 280);
  line('② 加料站：给冲好的杯子加 1~2 种小料', 310);
  line('③ 摇杯站：放进摇杯器摇约 2 秒，自动回到手里', 340);
  line('④ 出杯：点顾客点单票或按空格，送给点这杯的顾客', 370);
  line('手里一次只能拿一杯；3 颗星，订单过期扣 1 颗，用光就打烊。', 400, { size: 17, color: '#8a5a3a' });
  line('按键', 436, { size: 24, weight: 'bold', color: '#b8321f' });
  line('1 红茶   2 绿茶   3 奶茶   4 果茶', 470);
  line('Q 珍珠   W 布丁   E 红豆   R 椰果', 500);
  line('S 摇杯   空格 出杯   X 倒掉   P 暂停   M 静音   Shift+R 重开', 530);
  bigButton(ctx, state, titleStartBtn, '开始营业', 'Enter / 空格');
  txt(ctx, '鼠标也可以全程操作：点按钮、摇杯器和顾客点单票', 870, 680, { size: 16, color: '#c9a77a', align: 'center' });
}

function dim(ctx) {
  ctx.fillStyle = 'rgba(20,8,3,0.72)';
  ctx.fillRect(0, 0, W, H);
}

export function drawPause(ctx, state) {
  dim(ctx);
  fillRR(ctx, 340, 180, 600, 330, 22, '#fff3dc', '#c28650', 5);
  txt(ctx, '暂停中', W / 2, 240, { size: 56, weight: 'bold', color: '#b8321f', align: 'center' });
  txt(ctx, '茶馆先歇一会儿～', W / 2, 300, { size: 24, color: INK, align: 'center' });
  txt(ctx, '按 P 继续　·　按 Shift+R 重开', W / 2, 355, { size: 24, color: INK, align: 'center' });
  txt(ctx, '（切换窗口会自动暂停）', W / 2, 390, { size: 16, color: '#8a6a4a', align: 'center' });
  bigButton(ctx, state, pauseContinueBtn, '继续', null);
  bigButton(ctx, state, pauseRestartBtn, '重开', null);
}

function rank(score) {
  if (score >= 3000) return '传说店长';
  if (score >= 1800) return '王牌茶师';
  if (score >= 800) return '熟练店员';
  return '见习学徒';
}

export function drawResults(ctx, state) {
  dim(ctx);
  fillRR(ctx, 340, 50, 600, 600, 22, '#fff3dc', '#c28650', 5);
  const out = state.endReason === 'stars';
  txt(ctx, out ? '星星用完，茶馆打烊了…' : '营业结束！', W / 2, 105, { size: 40, weight: 'bold', color: out ? '#c4261d' : '#b8321f', align: 'center' });
  for (let i = 0; i < 3; i++) drawStar(ctx, W / 2 + (i - 1) * 76, 190, 32, i < state.stars);
  const rows = [
    ['得分', String(state.score)],
    ['金币', String(Math.floor(state.score / 10))],
    ['出杯数', String(state.served)],
    ['最高连击', String(state.bestCombo)],
  ];
  rows.forEach(([k, v], i) => {
    const y = 270 + i * 56;
    txt(ctx, k, 420, y, { size: 28, color: INK });
    txt(ctx, v, 860, y, { size: 32, weight: 'bold', color: i === 1 ? '#c98a00' : '#b8321f', align: 'right' });
    ctx.fillStyle = 'rgba(160,120,80,0.3)';
    ctx.fillRect(420, y + 26, 440, 2);
  });
  txt(ctx, `评价：${rank(state.score)}`, W / 2, 510, { size: 28, weight: 'bold', color: '#2e8b3d', align: 'center' });
  bigButton(ctx, state, resultsAgainBtn, '再来一局', 'Enter / 空格');
  bigButton(ctx, state, resultsTitleBtn, '返回标题', null);
}
