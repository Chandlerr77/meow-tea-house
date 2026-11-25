// 手机适配：竖屏提示浮层 + 全屏按钮（浮层显隐由 CSS 媒体查询控制）。
const root = document.documentElement;
const fsEnabled = !!(root.requestFullscreen || root.webkitRequestFullscreen);

export function initMobile() {
  const dismiss = document.getElementById('rotate-dismiss');
  if (dismiss) dismiss.addEventListener('click', () => root.classList.add('rotate-dismissed'));

  const btn = document.getElementById('fs-btn');
  if (!btn || !fsEnabled) return;
  root.classList.add('fs-ok');
  const isFs = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
  const sync = () => { btn.textContent = isFs() ? '退出全屏' : '全屏'; };
  btn.addEventListener('click', () => {
    try {
      let p;
      if (isFs()) p = (document.exitFullscreen || document.webkitExitFullscreen).call(document);
      else p = (root.requestFullscreen || root.webkitRequestFullscreen).call(root);
      if (p && p.catch) p.catch(() => {});
    } catch (e) {
      // 静默
    }
  });
  document.addEventListener('fullscreenchange', sync);
  document.addEventListener('webkitfullscreenchange', sync);
  sync();
}
