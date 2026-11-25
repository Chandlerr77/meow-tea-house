// 失败提示：错误音 + 提示文字。
import { say } from './state.js';
import { play } from './audio.js';

export function fail(state, msg) {
  say(state, msg, true);
  play('error');
  return { ok: false, msg };
}
