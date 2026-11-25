// WebAudio 合成音效，无任何外部资源。AudioContext 懒初始化。
let ctx = null;
let master = null;
let muted = false;
let noiseBuf = null;

const VOLUME = 0.5;

function ensure() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : VOLUME;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

export function unlock() {
  ensure();
}

export function setMuted(m) {
  muted = !!m;
  if (master) master.gain.value = muted ? 0 : VOLUME;
}

export function isMuted() {
  return muted;
}

function tone(c, t, { type = 'sine', f0, f1 = f0, dur = 0.2, gain = 0.3 }) {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function noise(c, t, { dur = 0.2, gain = 0.2, f0 = 1000, f1 = f0, q = 1 }) {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const src = c.createBufferSource();
  src.buffer = noiseBuf;
  src.loop = true;
  const f = c.createBiquadFilter();
  f.type = 'bandpass';
  f.Q.value = q;
  f.frequency.setValueAtTime(f0, t);
  f.frequency.linearRampToValueAtTime(f1, t + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(gain, t + Math.min(0.05, dur / 3));
  g.gain.linearRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(master);
  src.start(t);
  src.stop(t + dur + 0.02);
}

const SFX = {
  pour(c, t) {
    noise(c, t, { dur: 0.9, gain: 0.35, f0: 700, f1: 1700, q: 2 });
    for (let i = 0; i < 4; i++) {
      tone(c, t + 0.1 + i * 0.18, { f0: 300 + i * 90, f1: 520 + i * 90, dur: 0.1, gain: 0.08 });
    }
  },
  shake(c, t) {
    for (let i = 0; i < 14; i++) {
      noise(c, t + i * 0.13, { dur: 0.09, gain: 0.3, f0: 2800, f1: 3600, q: 3 });
      tone(c, t + i * 0.13, { type: 'triangle', f0: 180, f1: 120, dur: 0.06, gain: 0.07 });
    }
  },
  ding(c, t) {
    tone(c, t, { f0: 1568, dur: 0.7, gain: 0.28 });
    tone(c, t, { f0: 2349, dur: 0.5, gain: 0.1 });
  },
  coin(c, t) {
    tone(c, t, { type: 'square', f0: 988, dur: 0.09, gain: 0.12 });
    tone(c, t + 0.09, { type: 'square', f0: 1319, dur: 0.4, gain: 0.12 });
  },
  error(c, t) {
    tone(c, t, { type: 'sawtooth', f0: 190, f1: 100, dur: 0.18, gain: 0.2 });
    tone(c, t + 0.2, { type: 'sawtooth', f0: 150, f1: 80, dur: 0.25, gain: 0.2 });
  },
  click(c, t) {
    tone(c, t, { f0: 820, f1: 620, dur: 0.05, gain: 0.15 });
  },
};

export function play(name) {
  if (muted) return;
  const c = ensure();
  if (!c || !SFX[name]) return;
  try {
    SFX[name](c, c.currentTime);
  } catch (err) {
    console.error('audio error', err);
  }
}
