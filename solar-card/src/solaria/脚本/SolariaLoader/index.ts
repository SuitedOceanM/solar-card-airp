/* ============================================================
 * SolariaLoader · 卡片脚本侧的加载器（备用挂载路径）
 * 与"正则 + $('body').load()"那条路互补：
 *   正则路径：楼层里被替换成一段 jQuery.load，把 dist 单文件 HTML 灌进楼层 DOM
 *   本脚本路径：在酒馆助手的脚本 iframe 里执行 → 拉取同一个 dist HTML → srcdoc iframe 承载
 * 说明：本文件在 M1 只做"能加载、有兜底、有日志"，不参与 UI 逻辑。
 * 版本锁定：URL 里的 @<commit> 必须与卡片正则保持一致，避免线上漂移。
 * ============================================================ */

const REF = 'main';                                  // 首次推送后换成 tag 或 commit sha
const BASE = `https://testingcf.jsdelivr.net/gh/SuitedOceanM/solar-card-airp@${REF}/dist/solaria/界面/状态栏/index.html`;
const FALLBACK = `https://cdn.jsdelivr.net/gh/SuitedOceanM/solar-card-airp@${REF}/dist/solaria/界面/状态栏/index.html`;

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, { credentials: 'omit', mode: 'cors' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.text();
}

export async function loadSolaria(): Promise<void> {
  let html = '';
  try {
    html = await fetchHtml(BASE);
    console.log('[solaria] 主源加载成功', html.length, 'bytes');
  } catch (e) {
    console.warn('[solaria] 主源失败，回落镜像', e);
    html = await fetchHtml(FALLBACK);
    console.log('[solaria] 镜像加载成功', html.length, 'bytes');
  }
  console.log('[solaria] 已取到页面；M1 不自动挂载，交由卡片正则路径展开');
}
