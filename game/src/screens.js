// 标题、暂停、结算画面。
import {
  W, H, hit, titleStartBtn, levelButtons, tutorialCards, resultsButtons, pauseContinueBtn, pauseRestartBtn,
} from './layout.js';
import { fillRR, txt, circle, ellipse, poly, drawStar } from './draw.js';
import { MAX_LEVEL, getLevel } from './levels.js';

const INK = '#4a2c1a';
const CAT_X = 185;
const CAT_Y = 262;
const CAT_SCALE = 0.9;

const TONES = {
  red: ['#e0392b', '#ff5a45'],
  green: ['#2e9b4a', '#3fbf5f'],
  brown: ['#a8743f', '#c28650'],
};

function bigButton(ctx, state, r, label, hint, tone = 'red') {
  const hover = hit(r, state.mouse.x, state.mouse.y);
  const pulse = 1 + Math.sin(state.time * 4) * 0.015;
  const [base, light] = TONES[tone];
  ctx.save();
  ctx.translate(r.x + r.w / 2, r.y + r.h / 2);
  ctx.scale(hover ? 1.05 : pulse, hover ? 1.05 : pulse);
  ctx.translate(-r.w / 2, -r.h / 2);
  ctx.shadowColor = 'rgba(80,30,10,0.35)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;
  fillRR(ctx, 0, 0, r.w, r.h, 18, hover ? light : base, '#ffd36a', 4);
  ctx.shadowColor = 'transparent';
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

// 漂浮装饰：珍珠与迷你茶杯从底部缓缓上飘，带轻微左右摇摆
function drift(ctx, t) {
  const cupColors = ['#b5532a', '#8fbf4d', '#f0745e', '#d9b68c'];
  for (let i = 0; i < 18; i++) {
    const speed = 22 + (i % 5) * 7;
    const span = H + 120;
    const y = H + 60 - ((t * speed + i * 157) % span);
    const x = ((i * 211 + 70) % W) + Math.sin(t * 0.8 + i * 1.7) * 18;
    ctx.globalAlpha = 0.5;
    if (i % 3 === 0) {
      const s = 0.7 + (i % 4) * 0.1;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.sin(t * 0.7 + i) * 0.15);
      ctx.scale(s, s);
      poly(ctx, [[-14, -18], [14, -18], [10, 18], [-10, 18]], 'rgba(255,255,255,0.7)', '#a8743f', 2);
      poly(ctx, [[-12.5, -4], [12.5, -4], [10, 18], [-10, 18]], cupColors[i % 4]);
      fillRR(ctx, -16, -24, 32, 7, 3, '#fff9ee', '#a8743f', 2);
      ctx.strokeStyle = '#d9342b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(4, -24);
      ctx.lineTo(10, -40);
      ctx.stroke();
      ctx.restore();
    } else {
      const r = 6 + (i % 3) * 2;
      circle(ctx, x, y, r, '#3b2418');
      circle(ctx, x - r * 0.3, y - r * 0.35, r * 0.28, 'rgba(255,255,255,0.55)');
    }
  }
  ctx.globalAlpha = 1;
}

function cozyCup(ctx, cx, by, t) {
  // 托盘 + 瓷杯 + 茶面
  ellipse(ctx, cx, by, 40, 9, '#f6e9d2', 0, '#b99466', 2.5);
  fillRR(ctx, cx - 28, by - 46, 56, 44, 14, '#fffaf0', '#b99466', 3);
  fillRR(ctx, cx - 28, by - 30, 56, 9, 0, '#d9342b');
  ctx.beginPath();
  ctx.arc(cx + 30, by - 26, 12, -Math.PI / 2, Math.PI / 2);
  ctx.strokeStyle = '#b99466';
  ctx.lineWidth = 5;
  ctx.stroke();
  ellipse(ctx, cx, by - 46, 28, 7, '#b5532a', 0, '#b99466', 2.5);
  ellipse(ctx, cx - 6, by - 47, 12, 2.5, 'rgba(255,255,255,0.35)');
  // 蒸汽：3 条波浪线
  ctx.lineCap = 'round';
  for (let k = 0; k < 3; k++) {
    const phase = (t * 0.7 + k * 0.33) % 1;
    ctx.strokeStyle = `rgba(255,255,255,${0.75 * Math.sin(phase * Math.PI)})`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let y = 0; y <= 46; y += 3) {
      const px = cx - 14 + k * 14 + Math.sin(t * 2.4 + y * 0.18 + k * 1.3) * 5;
      const py = by - 58 - phase * 20 - y;
      y ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.stroke();
  }
}

function manekiNeko(ctx, cx, cy, t) {
  const blink = t % 3 > 2.8;
  // 摇摆的尾巴（在身体后面）
  const sway = Math.sin(t * 2.6);
  const tail = () => {
    ctx.beginPath();
    ctx.moveTo(cx + 70, cy + 238);
    ctx.bezierCurveTo(cx + 140, cy + 252, cx + 150 + sway * 12, cy + 190, cx + 112 + sway * 28, cy + 134);
  };
  ctx.lineCap = 'round';
  tail();
  ctx.strokeStyle = '#d3bfa0';
  ctx.lineWidth = 30;
  ctx.stroke();
  tail();
  ctx.strokeStyle = '#fffaf0';
  ctx.lineWidth = 24;
  ctx.stroke();
  circle(ctx, cx + 112 + sway * 28, cy + 134, 12, '#f0a04b');
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
  // 脸：睁眼（约每 3 秒眨一次）
  ctx.strokeStyle = '#3a2a22';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  for (const s of [-1, 1]) {
    if (blink) {
      ctx.beginPath();
      ctx.arc(cx + s * 42, cy + 20, 14, 0.12 * Math.PI, 0.88 * Math.PI);
      ctx.stroke();
    } else {
      ellipse(ctx, cx + s * 42, cy + 24, 11, 14, '#2f2019');
      circle(ctx, cx + s * 42 - 3.5, cy + 18, 4, '#fff');
      circle(ctx, cx + s * 42 + 3, cy + 29, 2, 'rgba(255,255,255,0.7)');
    }
    circle(ctx, cx + s * 66, cy + 52, 13, 'rgba(244,140,160,0.6)');
  }
  poly(ctx, [[cx - 7, cy + 38], [cx + 7, cy + 38], [cx, cy + 47]], '#e8758a');
  ctx.strokeStyle = '#3a2a22';
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

function padlock(ctx, cx, cy) {
  ctx.strokeStyle = '#9a8a74';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(cx, cy - 3, 5, Math.PI, 0);
  ctx.stroke();
  fillRR(ctx, cx - 7, cy - 3, 14, 11, 2.5, '#b5a58c', '#9a8a74', 1.5);
}

function levelButton(ctx, state, i) {
  const r = levelButtons[i];
  const n = i + 1;
  const prog = state.progress;
  const open = n <= prog.unlocked;
  const best = prog.best[String(n)];
  const cleared = best >= getLevel(n).target;
  const current = n === Math.min(MAX_LEVEL, prog.unlocked);
  const hover = hit(r, state.mouse.x, state.mouse.y);
  const cx = r.x + r.w / 2;
  ctx.save();
  if (open && hover) {
    ctx.translate(cx, r.y + r.h / 2);
    ctx.scale(1.04, 1.04);
    ctx.translate(-cx, -(r.y + r.h / 2));
  }
  if (open) {
    ctx.shadowColor = 'rgba(90,50,20,0.3)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;
    fillRR(ctx, r.x, r.y, r.w, r.h, 14, hover ? '#fff' : '#fffaf0', current ? '#e0392b' : '#c28650', current ? 4 : 3);
    ctx.shadowColor = 'transparent';
    if (current) {
      ctx.globalAlpha = 0.35 + 0.35 * Math.sin(state.time * 5);
      fillRR(ctx, r.x - 4, r.y - 4, r.w + 8, r.h + 8, 17, null, '#ff8a3d', 3);
      ctx.globalAlpha = 1;
    }
    txt(ctx, `第 ${n} 关`, cx, r.y + 27, { size: 22, weight: 'bold', color: current ? '#b8321f' : INK, align: 'center' });
    txt(ctx, best ? `最佳 ${best}` : '未通关', cx, r.y + 58, { size: 16, color: best ? '#2e8b3d' : '#9a7a58', align: 'center' });
    if (cleared) drawStar(ctx, r.x + r.w - 18, r.y + 18, 11, true);
  } else {
    fillRR(ctx, r.x, r.y, r.w, r.h, 14, 'rgba(206,190,166,0.85)', '#b5a58c', 2);
    txt(ctx, `第 ${n} 关`, cx, r.y + 27, { size: 22, weight: 'bold', color: '#a39682', align: 'center' });
    padlock(ctx, cx - 26, r.y + 58);
    txt(ctx, '未解锁', cx + 8, r.y + 58, { size: 16, color: '#a39682', align: 'center' });
  }
  ctx.restore();
}

// ---- 玩法图标卡片 ----
function iconKettle(ctx, cx, cy, t) {
  const tilt = Math.sin(t * 2) * 0.05;
  ctx.save();
  ctx.translate(cx - 4, cy - 2);
  ctx.rotate(tilt - 0.12);
  ctx.beginPath();
  ctx.arc(14, -2, 11, -Math.PI / 2, Math.PI / 2);
  ctx.strokeStyle = '#8a1c1c';
  ctx.lineWidth = 4;
  ctx.stroke();
  poly(ctx, [[-16, -6], [-30, -16], [-27, -9], [-16, 6]], '#d9342b', '#8a1c1c', 2);
  ellipse(ctx, 0, 0, 20, 17, '#d9342b', 0, '#8a1c1c', 2.5);
  ellipse(ctx, -6, -6, 8, 4, 'rgba(255,255,255,0.4)');
  fillRR(ctx, -8, -23, 16, 7, 3, '#ffcf3f', '#b8860b', 2);
  ctx.restore();
  ctx.strokeStyle = '#b5532a';
  ctx.lineWidth = 3;
  ctx.setLineDash([4, 4]);
  ctx.lineDashOffset = -t * 20;
  ctx.beginPath();
  ctx.moveTo(cx - 33, cy - 8);
  ctx.lineTo(cx - 33, cy + 20);
  ctx.stroke();
  ctx.setLineDash([]);
}

function iconCup(ctx, cx, cy, color, pearls) {
  poly(ctx, [[cx - 18, cy - 20], [cx + 18, cy - 20], [cx + 13, cy + 22], [cx - 13, cy + 22]], 'rgba(255,255,255,0.6)', '#8a5a3a', 2.5);
  poly(ctx, [[cx - 16.5, cy - 8], [cx + 16.5, cy - 8], [cx + 13, cy + 22], [cx - 13, cy + 22]], color);
  if (pearls) for (const [dx, dy] of [[-7, 16], [0, 17], [7, 16], [-3, 11], [4, 11]]) circle(ctx, cx + dx, cy + dy, 3.6, '#3b2418');
}

function iconTopping(ctx, cx, cy, t) {
  iconCup(ctx, cx, cy + 4, '#d9b68c', true);
  const d = (t * 1.5) % 1;
  circle(ctx, cx - 8, cy - 30 + d * 20, 4, '#f6d56a', '#b8860b', 1.5);
  circle(ctx, cx + 8, cy - 36 + ((d + 0.5) % 1) * 20, 4, '#9b2f3a', '#5a1018', 1.5);
}

function iconShaker(ctx, cx, cy, t) {
  ctx.save();
  ctx.translate(cx + Math.sin(t * 14) * 2, cy);
  ctx.rotate(Math.sin(t * 11) * 0.12);
  const g = ctx.createLinearGradient(-15, 0, 15, 0);
  g.addColorStop(0, '#9aa3ad');
  g.addColorStop(0.45, '#eef2f5');
  g.addColorStop(1, '#8a929c');
  fillRR(ctx, -15, -14, 30, 40, 6, g, '#59616b', 2.5);
  fillRR(ctx, -12, -24, 24, 11, 5, '#c8ced6', '#59616b', 2.5);
  fillRR(ctx, -5, -32, 10, 8, 3, '#aab2bb', '#59616b', 2);
  ctx.restore();
  ctx.strokeStyle = '#4aa3df';
  ctx.lineWidth = 3;
  for (const s of [-1, 1]) {
    for (const k of [0, 1]) {
      ctx.beginPath();
      const a0 = s > 0 ? -0.6 : Math.PI - 0.6;
      ctx.arc(cx, cy + 4, 27 + k * 7, a0, a0 + 1.2);
      ctx.stroke();
    }
  }
}

function iconServe(ctx, cx, cy, t) {
  iconCup(ctx, cx - 10, cy + 2, '#f0745e', false);
  ctx.strokeStyle = '#ff8fb1';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx - 6, cy - 32);
  ctx.lineTo(cx - 12, cy + 8);
  ctx.stroke();
  const nudge = Math.sin(t * 5) * 3;
  ctx.strokeStyle = '#2e9b4a';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(cx + 12 + nudge, cy + 2);
  ctx.lineTo(cx + 32 + nudge, cy + 2);
  ctx.moveTo(cx + 25 + nudge, cy - 7);
  ctx.lineTo(cx + 33 + nudge, cy + 2);
  ctx.lineTo(cx + 25 + nudge, cy + 11);
  ctx.stroke();
}

const CARDS = [
  { title: '冲茶', desc: '选茶底，冲约 3 秒', key: '1-6', icon: iconKettle },
  { title: '加料', desc: '加 1~2 种小料', key: 'Q W E R', icon: iconTopping },
  { title: '摇杯', desc: '摇 2 秒自动回手', key: 'S', icon: iconShaker },
  { title: '出杯', desc: '点点单票送给顾客', key: '空格', icon: iconServe },
];

function tutorialCard(ctx, r, card, t) {
  ctx.save();
  ctx.shadowColor = 'rgba(90,50,20,0.25)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;
  fillRR(ctx, r.x, r.y, r.w, r.h, 16, 'rgba(255,250,240,0.94)', '#c28650', 2.5);
  ctx.restore();
  card.icon(ctx, r.x + 54, r.y + 38, t);
  ctx.font = 'bold 14px sans-serif';
  const pw = Math.max(34, card.key.length * 9 + 18);
  fillRR(ctx, r.x + r.w - pw - 14, r.y + 24, pw, 24, 8, '#7b2d1a');
  txt(ctx, card.key, r.x + r.w - pw / 2 - 14, r.y + 36, { size: 14, weight: 'bold', color: '#ffe9b0', align: 'center' });
  txt(ctx, card.title, r.x + r.w / 2, r.y + 82, { size: 24, weight: 'bold', color: '#b8321f', align: 'center' });
  txt(ctx, card.desc, r.x + r.w / 2, r.y + 108, { size: 15, color: '#8a5a3a', align: 'center' });
}

export function drawTitle(ctx, state) {
  const t = state.time;
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#fff3dc');
  bg.addColorStop(0.5, '#e8b985');
  bg.addColorStop(1, '#b98a5e');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  drift(ctx, t);
  lantern(ctx, 96, 96, t);
  lantern(ctx, W - 96, 96, t + 1);

  // 标题 + 副标题 pill
  ctx.save();
  ctx.shadowColor = 'rgba(110,50,20,0.4)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 6;
  txt(ctx, '喵喵茶馆', W / 2, 70, { size: 88, weight: 'bold', color: '#fff8e8', align: 'center', stroke: '#7b2d1a', sw: 14 });
  ctx.restore();
  fillRR(ctx, W / 2 - 215, 128, 430, 38, 19, 'rgba(123,45,26,0.92)', '#ffd36a', 2.5);
  txt(ctx, '猫咪店长的珍珠奶茶时间管理游戏', W / 2, 147, { size: 21, color: '#ffe9b0', align: 'center' });

  // 猫咪店长 + 热茶
  ellipse(ctx, CAT_X + 100, CAT_Y + 252, 190, 16, 'rgba(90,50,20,0.22)');
  ctx.save();
  ctx.translate(CAT_X, CAT_Y);
  ctx.scale(CAT_SCALE, CAT_SCALE);
  manekiNeko(ctx, 0, 0, t);
  ctx.restore();
  cozyCup(ctx, 372, 506, t);

  // 关卡选择
  txt(ctx, '选择关卡', 446, 184, { size: 23, weight: 'bold', color: '#7b2d1a' });
  txt(ctx, '点击已解锁的关卡直接开始', 1234, 185, { size: 15, color: '#7b5a3a', align: 'right' });
  for (let i = 0; i < levelButtons.length; i++) levelButton(ctx, state, i);

  // 玩法卡片
  CARDS.forEach((card, i) => tutorialCard(ctx, tutorialCards[i], card, t));

  const start = Math.min(MAX_LEVEL, state.progress.unlocked);
  bigButton(ctx, state, titleStartBtn, '开始营业', `第 ${start} 关 · Enter / 空格`);
  txt(ctx, '鼠标 / 触屏也能全程操作：点按钮、摇杯器和顾客点单票', 840, 646, { size: 15, color: '#6b4a2a', align: 'center' });
  const toast = state.toast;
  if (toast) {
    ctx.globalAlpha = Math.min(1, (toast.life - toast.age) * 2);
    fillRR(ctx, 840 - 130, 662, 260, 34, 17, 'rgba(123,45,26,0.92)');
    txt(ctx, toast.text, 840, 679, { size: 18, weight: 'bold', color: '#ffe9b0', align: 'center' });
    ctx.globalAlpha = 1;
  }
}

function dim(ctx) {
  ctx.fillStyle = 'rgba(20,8,3,0.72)';
  ctx.fillRect(0, 0, W, H);
}

export function drawPause(ctx, state) {
  dim(ctx);
  fillRR(ctx, 340, 180, 600, 330, 22, '#fff3dc', '#c28650', 5);
  txt(ctx, '暂停中', W / 2, 240, { size: 56, weight: 'bold', color: '#b8321f', align: 'center' });
  txt(ctx, `第 ${state.level} 关 · 目标 ${state.target} 分`, W / 2, 300, { size: 24, color: INK, align: 'center' });
  txt(ctx, '按 P 继续　·　按 Shift+R 重开本关', W / 2, 355, { size: 24, color: INK, align: 'center' });
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
  const won = state.won;
  const last = state.level >= MAX_LEVEL;
  const showNext = won && !last;
  fillRR(ctx, 340, 50, 600, 600, 22, '#fff3dc', '#c28650', 5);
  let head = '未达标，再试一次！';
  if (won) head = last ? '恭喜通关全部关卡！' : '通关！';
  txt(ctx, head, W / 2, 100, { size: won && last ? 38 : 44, weight: 'bold', color: won ? '#2e8b3d' : '#c4261d', align: 'center' });
  const sub = state.endReason === 'stars' ? '星星用完，茶馆打烊了…' : '营业结束';
  txt(ctx, `第 ${state.level} 关 · ${sub}`, W / 2, 142, { size: 20, color: '#8a6a4a', align: 'center' });
  for (let i = 0; i < 3; i++) drawStar(ctx, W / 2 + (i - 1) * 76, 196, 30, i < state.stars);

  // 目标 / 得分对比
  const reached = state.score >= state.target;
  txt(ctx, '目标', 500, 252, { size: 20, color: '#8a6a4a', align: 'center' });
  txt(ctx, String(state.target), 500, 292, { size: 44, weight: 'bold', color: INK, align: 'center' });
  txt(ctx, reached ? '≥' : '<', W / 2, 288, { size: 36, weight: 'bold', color: reached ? '#2e8b3d' : '#c4261d', align: 'center' });
  txt(ctx, '得分', 780, 252, { size: 20, color: '#8a6a4a', align: 'center' });
  txt(ctx, String(state.score), 780, 292, { size: 44, weight: 'bold', color: reached ? '#2e8b3d' : '#c4261d', align: 'center' });
  fillRR(ctx, 420, 328, 440, 14, 7, 'rgba(160,120,80,0.25)');
  const prog = Math.min(1, state.score / state.target);
  if (prog > 0) fillRR(ctx, 420, 328, Math.max(14, 440 * prog), 14, 7, reached ? '#3fbf5f' : '#e0662b');

  const rows = [
    ['金币', String(Math.floor(state.score / 10))],
    ['出杯数', String(state.served)],
    ['最高连击', String(state.bestCombo)],
  ];
  rows.forEach(([k, v], i) => {
    const y = 380 + i * 42;
    txt(ctx, k, 420, y, { size: 24, color: INK });
    txt(ctx, v, 860, y, { size: 28, weight: 'bold', color: i === 0 ? '#c98a00' : '#b8321f', align: 'right' });
    ctx.fillStyle = 'rgba(160,120,80,0.3)';
    ctx.fillRect(420, y + 21, 440, 2);
  });
  txt(ctx, `评价：${rank(state.score)}`, W / 2, 516, { size: 24, weight: 'bold', color: '#2e8b3d', align: 'center' });
  let note = '';
  let noteColor = '#8a6a4a';
  if (won && last) { note = '你已经是传说级茶馆店长！'; noteColor = '#c98a00'; }
  else if (won && state.unlockedNew) { note = `已解锁第 ${state.level + 1} 关！`; noteColor = '#2e8b3d'; }
  else if (won) { note = `第 ${state.level + 1} 关早已解锁`; }
  else if (state.stars > 0) { note = `还差 ${state.target - state.score} 分达到目标`; noteColor = '#c4261d'; }
  else { note = '订单别拖太久，星星很宝贵'; noteColor = '#c4261d'; }
  txt(ctx, note, W / 2, 546, { size: 20, weight: 'bold', color: noteColor, align: 'center' });

  const b = resultsButtons(showNext);
  if (b.next) bigButton(ctx, state, b.next, '下一关', 'Enter / 空格', 'green');
  bigButton(ctx, state, b.again, '再来一局', showNext ? null : 'Enter / 空格');
  bigButton(ctx, state, b.title, '返回标题', null, 'brown');
}
