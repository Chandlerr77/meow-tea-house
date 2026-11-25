// 冲泡槽、加料、摇杯器逻辑，以及“手里只能拿一杯”的约束。
import { BREW_SECONDS, SHAKE_SECONDS } from './timer.js';
import { createBrewSlot, say } from './state.js';
import { BASES } from './drinks.js';
import { baseUnlockLevel } from './levels.js';
import { fail } from './feedback.js';
import { play } from './audio.js';

// 当前加料/摇杯的目标：手动选中的已完成槽，否则最新完成的槽
export function targetSlot(state) {
  const ready = (s) => s && s.cup && s.done && !s.cup.shaken;
  const sel = state.brewSlots[state.selected];
  if (ready(sel)) return sel;
  let best = null;
  for (const s of state.brewSlots) {
    if (ready(s) && (!best || s.doneSeq > best.doneSeq)) best = s;
  }
  return best;
}

export function selectSlot(state, index) {
  const s = state.brewSlots[index];
  if (s && s.cup && s.done) state.selected = index;
}

// 茶底是否已在当前关卡解锁
export function baseUnlocked(state, baseIndex) {
  return baseIndex < state.levelCfg.bases;
}

export function startBrew(state, baseId) {
  const bi = BASES.findIndex((b) => b.id === baseId);
  if (bi < 0) return { ok: false };
  if (!baseUnlocked(state, bi)) return fail(state, `${BASES[bi].name}：第 ${baseUnlockLevel(bi)} 关解锁`);
  if (state.hand) return fail(state, '手里已有饮品');
  const slot = state.brewSlots.find((s) => !s.cup);
  if (!slot) return fail(state, '冲泡槽已满');
  slot.cup = { base: baseId, toppings: [], shaken: false, brewed: false };
  slot.progress = 0;
  slot.done = false;
  play('pour');
  return { ok: true };
}

export function addTopping(state, toppingId) {
  const slot = targetSlot(state);
  if (!slot) return fail(state, '还没有冲好的茶');
  if (slot.cup.toppings.length >= 2) return fail(state, '每杯最多两种小料');
  if (slot.cup.toppings.includes(toppingId)) return fail(state, '这杯已经加过了');
  slot.cup.toppings.push(toppingId);
  play('click');
  return { ok: true };
}

export function startShake(state) {
  const sh = state.shaker;
  if (sh.cup) return fail(state, '摇杯器正忙');
  const slot = targetSlot(state);
  if (!slot) return fail(state, '先冲好一杯茶再摇');
  sh.cup = slot.cup;
  sh.progress = 0;
  sh.done = false;
  Object.assign(slot, createBrewSlot());
  state.selected = -1;
  play('shake');
  return { ok: true };
}

// 倒掉手里的杯子：做错杯或订单已过期时可脱身，不扣连击、不扣星。
export function discardHand(state) {
  if (!state.hand) return fail(state, '手里没有饮品');
  state.hand = null;
  say(state, '已倒掉这杯');
  play('click');
  return { ok: true };
}

export function updateStations(state, dt) {
  for (const slot of state.brewSlots) {
    if (slot.cup && !slot.done) {
      slot.progress = Math.min(1, slot.progress + dt / BREW_SECONDS);
      if (slot.progress >= 1) {
        slot.done = true;
        slot.cup.brewed = true;
        slot.doneSeq = ++state.serial;
        play('ding');
      }
    }
  }
  const sh = state.shaker;
  if (sh.cup && !sh.done) {
    sh.progress = Math.min(1, sh.progress + dt / SHAKE_SECONDS);
    if (sh.progress >= 1) sh.done = true;
  }
  // 摇好后自动回到手里（手里有杯时在摇杯器里等待）
  if (sh.cup && sh.done && !state.hand) {
    state.hand = { base: sh.cup.base, toppings: [...sh.cup.toppings], shaken: true, brewed: true };
    sh.cup = null;
    sh.progress = 0;
    sh.done = false;
    play('ding');
  }
}
