import './vue-flags'; // 必须第一个 import：补 __VUE_PROD_DEVTOOLS__ 等 flag（CDN 版 pinia 依赖，否则黑屏）
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import './global.css';
import { BUILD_VERSION } from './version';

console.log('[索拉利亚] 构建版本', BUILD_VERSION);

// ============================================================
// 入口 · "楼层里只留启动按钮 + 点到顶层全屏展开"
// ------------------------------------------------------------
// 运行环境：酒馆助手「前端界面」= 楼层内无沙盒 iframe，generateRaw / getVariables 等全局开箱即用。
// 问题：把整套 UI 直接挂进楼层，会被挤进窄窄的消息列。
// 方案：楼层里只渲染一个【展开】按钮；点击后把 App 挂到 window.top 的全屏宿主里覆盖显示。
//       JS 仍在楼层 iframe 上下文跑（保留酒馆全局），只是 DOM 提到了顶层。
//       global.css 已把样式收敛到 .solaria-root，故克隆 <style> 进顶层 <head> 不会污染酒馆本体。
// 退化：拿不到 window.top（跨域/异常）→ 楼层内直接挂载（挤但可用）。
// ============================================================

const HOST_ID = 'solaria-fs';
const INLINE_ID = 'solaria-inline';

function showFatal(msg: string): void {
  const el = document.getElementById('app');
  if (el) {
    el.innerHTML = '<div style="padding:16px;color:#FF5A4D;background:#0E0F12;font-family:monospace;'
      + 'font-size:12px;white-space:pre-wrap;line-height:1.6;">[索拉利亚 挂载失败]\n' + msg + '</div>';
  }
}
window.addEventListener('error', (e) => showFatal('window.error: ' + (e.error?.stack || e.message || String(e))));
window.addEventListener('unhandledrejection', (e) => showFatal('unhandledrejection: ' + (e.reason?.stack || String(e.reason))));

function getTopDoc(): Document | null {
  try { return window.top?.document ?? null; } catch { return null; }
}

$(() => {
  try {
    const local = document.getElementById('app');
    if (!local) { console.warn('[索拉利亚] 无 #app'); return; }

    // 清理上一个 iframe 生命周期留下的顶层宿主（楼层重渲染会导致 iframe 重载，旧宿主会僵在顶层）
    try {
      const stale = getTopDoc()?.getElementById(HOST_ID);
      if (stale) { stale.remove(); console.log('[索拉利亚] 已清理陈旧顶层宿主'); }
    } catch { /* ignore */ }

    // —— 楼层内的启动块（终端风：石墨底 + 黄框） ——
    local.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.style.cssText = [
      'padding:26px 18px', 'border:1px solid #2F323A', 'border-left:3px solid #FFFA00',
      'background:linear-gradient(180deg,#16171C,#0E0F12)',
      'box-shadow:inset 0 0 30px rgba(0,0,0,.6)',
    ].join(';');
    const btn = document.createElement('button');
    btn.textContent = '◤ 展 开 · 索 拉 利 亚';
    btn.style.cssText = [
      'display:block', 'width:100%', 'max-width:520px', 'margin:0 auto', 'padding:14px',
      'font-family:"Rajdhani","HarmonyOS Sans SC",sans-serif', 'font-size:22px', 'letter-spacing:8px',
      'color:#000', 'cursor:pointer', 'border:none', 'background:#FFFA00', 'font-weight:700',
    ].join(';');
    wrap.appendChild(btn);
    local.appendChild(wrap);

    let host: HTMLElement | null = null;
    let inlineMounted = false;

    function mountInline(): void {
      if (inlineMounted) return;
      local!.innerHTML = '<div style="font:11px monospace;color:#FFFA00;padding:2px 6px;">[索拉利亚 · 内联模式]</div>'
        + '<div id="' + INLINE_ID + '" style="min-height:560px;height:70vh;"></div>';
      const app = createApp(App);
      app.provide('solariaCollapse', () => { try { location.reload(); } catch { /* ignore */ } });
      app.use(createPinia()).mount('#' + INLINE_ID);
      inlineMounted = true;
    }

    function open(): void {
      try { openInner(); } catch (err) {
        const stack = (err as Error)?.stack || String(err);
        console.error('[索拉利亚] open 失败', err);
        if (local) {
          local.innerHTML = '<div style="padding:16px;color:#FF5A4D;background:#0E0F12;font-family:monospace;'
            + 'font-size:12px;white-space:pre-wrap;line-height:1.6;">[索拉利亚 展开失败]\n\n' + stack + '</div>';
        }
      }
    }

    function openInner(): void {
      const topDoc = getTopDoc();
      if (!topDoc || !topDoc.body) {
        console.warn('[索拉利亚] path=inline：顶层不可达，楼层内退化挂载');
        mountInline();
        return;
      }
      if (host) { host.style.setProperty('display', 'block', 'important'); return; }

      // 1) 把本文档（楼层）的所有 <style> 克隆到顶层 <head>（已 scope 到 .solaria-root）
      document.querySelectorAll('style').forEach((s) => {
        try {
          const c = topDoc.importNode(s, true) as HTMLElement;
          c.setAttribute('data-solaria', '');
          (topDoc.head ?? topDoc.body).appendChild(c);
        } catch (e) { console.warn('[索拉利亚] 样式克隆失败（跳过一条）', e); }
      });

      // 2) 全屏宿主：挂 documentElement（躲开 body 上的 transform/contain）+ 内联 !important
      host = topDoc.createElement('div');
      host.id = HOST_ID;
      const hostCss: [string, string][] = [
        ['display', 'block'], ['position', 'fixed'], ['top', '0'], ['left', '0'],
        ['width', '100vw'], ['height', '100vh'], ['height', '100dvh'],
        ['margin', '0'], ['padding', '0'], ['border', 'none'],
        ['transform', 'none'], ['opacity', '1'], ['visibility', 'visible'],
        ['z-index', '2147483600'], ['background', '#131418'], ['overflow', 'auto'],
        ['-webkit-overflow-scrolling', 'touch'],
      ];
      for (const [k, v] of hostCss) { try { host.style.setProperty(k, v, 'important'); } catch { /* ignore */ } }
      (topDoc.documentElement ?? topDoc.body).appendChild(host);

      // 放开顶层文档的缩放限制（部分酒馆页锁 user-scalable=no）
      try {
        let vp = topDoc.querySelector('meta[name="viewport"]') as HTMLMetaElement | null;
        if (!vp) {
          vp = topDoc.createElement('meta');
          vp.name = 'viewport';
          topDoc.head?.appendChild(vp);
        }
        vp.content = 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes';
      } catch { /* 调整失败不阻塞挂载 */ }

      // 3) 挂载 App（JS 仍在楼层 iframe → 酒馆全局可用）
      const mountEl = topDoc.createElement('div');
      host.appendChild(mountEl);
      try {
        const app = createApp(App);
        app.provide('solariaCollapse', () => { if (host) host.style.setProperty('display', 'none', 'important'); });
        app.use(createPinia()).mount(mountEl);
        console.log('[索拉利亚] path=fullscreen 全屏前端已挂载');

        // 几何自检：350ms 后量宿主实际渲染盒，被宿主页 CSS 压塌就回退内联
        setTimeout(() => {
          try {
            if (!host || !host.isConnected) return;
            const rc = host.getBoundingClientRect();
            const w = topDoc.defaultView?.innerWidth ?? 0;
            const h = topDoc.defaultView?.innerHeight ?? 0;
            const visible = rc.width >= Math.min(280, w * 0.7) && rc.height >= Math.min(280, h * 0.5)
              && rc.bottom > 0 && rc.right > 0 && rc.top < h && rc.left < w;
            console.log('[索拉利亚] 宿主几何自检', JSON.stringify({ x: rc.x, y: rc.y, w: rc.width, h: rc.height, vw: w, vh: h, visible }));
            if (!visible) {
              console.warn('[索拉利亚] 顶层宿主被压制不可见，回退楼层内联挂载');
              host.remove(); host = null;
              mountInline();
            }
          } catch (e) { console.warn('[索拉利亚] 几何自检异常（忽略）', e); }
        }, 350);
      } catch (mountErr) {
        const stack = (mountErr as Error)?.stack || String(mountErr);
        mountEl.innerHTML = '<div style="padding:24px;color:#FF5A4D;font-family:monospace;font-size:13px;'
          + 'white-space:pre-wrap;line-height:1.7;">[索拉利亚 挂载失败]\n\n' + stack
          + '\n\n<button onclick="document.getElementById(\'' + HOST_ID + '\').style.setProperty(\'display\',\'none\',\'important\')" '
          + 'style="margin-top:12px;padding:8px 18px;cursor:pointer;">关闭返回酒馆</button></div>';
        console.error('[索拉利亚] mount 失败', mountErr);
      }
    }

    btn.addEventListener('click', open);
    wrap.addEventListener('click', (e) => { if (e.target === wrap) open(); });
    window.addEventListener('pagehide', () => { try { host?.remove(); } catch { /* ignore */ } });
    console.log('[索拉利亚] 启动按钮已就绪');
  } catch (err) {
    console.error('[索拉利亚] 入口异常', err);
    showFatal('entry catch: ' + ((err as Error)?.stack || String(err)));
  }
});
