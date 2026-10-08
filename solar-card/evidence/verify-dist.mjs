/* 产物结构校验（不需要浏览器）：检查构建产物是否满足 M1 的硬性约束 */
import fs from 'node:fs';

const FILE = 'C:/Users/lcy/Documents/Codex/2026-09-29/b-k/work/solar-card/project/dist/solaria/界面/状态栏/index.html';
const html = fs.readFileSync(FILE, 'utf8');
// 产物里的 CSS 已被 minify（去掉了空格），后面做 CSS 断言时统一去空白再比
const styleBlocks = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n');
const cssFlat = styleBlocks.replace(/\s+/g, '');
/** CSS 断言 helper：把期望串也去空白，避免"人写的带空格、产物已压缩"造成的误报 */
const cssHas = (s) => cssFlat.includes(s.replace(/\s+/g, ''));
let pass = 0;
let fail = 0;
const check = (name, cond, extra = '') => {
  if (cond) { pass += 1; console.log(`  ✓ ${name}`); } else { fail += 1; console.log(`  ✗ ${name} ${extra}`); }
};

console.log('— 产物结构 —');
check('单文件 HTML 且已内联脚本', /<script type="module">/.test(html) && html.includes('</html>') === false ? true : /<script type="module">/.test(html));
check('体积合理（< 200 KB）', Buffer.byteLength(html) < 200 * 1024, `${Math.round(Buffer.byteLength(html) / 1024)} KB`);
check('pinia 走 CDN ESM（与模板一致）', html.includes('testingcf.jsdelivr.net/npm/pinia/+esm'));
check('vue 作为全局外部依赖（非打包进产物）', /const \w+=Vue[,;]/.test(html), '没找到 const x=Vue 的外部引用');
check('楼层启动按钮文案存在', html.includes('展 开 · 索 拉 利 亚'));
check('样式已作用域到 .solaria-root', html.includes('.solaria-root'));

console.log('— 视觉口径 v2（主界面浅色 / 创建向导黄黑） —');
check('主界面底色为白', /--so-bg:\s*#FFFFFF/i.test(html));
check('主文字为黑', /--so-ink:\s*#111111/i.test(html));
check('主按钮块为黑底白字', /--so-accent:\s*#111111/i.test(html) && /--so-accent-ink:\s*#FFFFFF/i.test(html));
check('左栏改为"影子淡出"（向右淡出的软阴影）', /box-shadow:\s*8px 0 18px -10px/i.test(html));
check('主区左缘有渐隐过渡层', /linear-gradient\(90deg,\s*rgba\(0,\s*0,\s*0,\s*\.06\)/i.test(html));
check('已移除黄色竖带（主界面无 --so-band 使用）', !/var\(--so-band\)/i.test(html));
check('创建向导黄黑 token 已留位', /--so-crt-accent:\s*#FFFA00/i.test(html) && /--so-crt-bg:\s*#131313/i.test(html));
check('木纹变量已移除（不再有 wood 渐变）', !html.includes('repeating-linear-gradient(90deg,#181109'));
// D31 起：选中态不再是"浅灰块"，而是 191919 文字 + 左侧黑条（见下方导航三态断言）
check('左栏选中态已按 D31 改为"文字变深 + 左侧黑条"',
  cssHas('.so-nav button.on { color: var(--nav-on)') && cssHas('.so-nav button.on::before')
  && !cssHas('.so-nav button.on { background:'));

console.log('— 结构：取消顶栏，信息进状态栏 —');
check('不再有 so-head 顶栏节点', !html.includes('so-head'));
check('底部状态栏承载身份信息', html.includes('so-foot') && html.includes('姓名') && html.includes('支族'));
check('页头使用 // LATIN + 中文标题结构', html.includes('so-page') && html.includes('kicker'));

console.log('— 存档并入设置（共用同一枚图标） —');
check('设置页含存档区块', html.includes('存档 / SAVE') && html.includes('保存到当前聊天'));
check('终端页改为指向设置的提示（不再自带存取按钮）', html.includes('存档与读档已移到「设置」'));
check('用户提供的图标 path 已内联', html.includes('M 23.312 44.301') || html.includes('23.312 44.301'));
check('图标用 currentColor 填充（随选中态变色）', html.includes('currentColor'));

console.log('— 左栏四项与图标对应 —');
check('「干员」已改名为「档案」', html.includes('ARCHIVE') && !html.includes('OPERATIVE'));
check('个人档案页 = 原干员页内容', html.includes('个人档案 / PROFILE') && html.includes('属性 / ATTRIBUTES'));
check('档案用 ID 卡图标（x 到 43.057）', html.includes('43.057 48.47'));
check('资料页为空态骨架（解锁制说明）', html.includes('世界观档案 / DATA') && html.includes('解锁'));
check('资料用第三枚图标（x 到 41.891）', html.includes('41.891 0.188'));
check('资料页占位分类已就位', html.includes('七层结构') && html.includes('十二支族'));

console.log('— 日志页（第五项，第四枚图标） —');
check('左栏出现「日志」入口', html.includes('>日志<') || html.includes('LOG'));
check('日志页四分组骨架（目标已移出 → 前情摘要）',
  ['事件线 / THREADS', '人物 / CONTACTS', '大事记 / CHRONICLE', '前情摘要 / RECAP'].every((k) => html.includes(k)));
check('日志用第四枚图标（含 42.014 40.01 的路径）', html.includes('42.014 40.01'));
check('日志页写明与资料的分工', html.includes('资料 = 世界是什么'));

console.log('— 地图页（第六项，自制指南针图标） —');
check('左栏出现「地图」入口', html.includes('>地图<') || html.includes('MAP'));
check('折叠地图图标已内联（三面板 + 中段平 + 端角圆角）',
  html.includes('Q 6 7 7.77 7.33') && html.includes('M 18.27 12.2 L 25.73 12.2'));
// 备选指南针未被引用，webpack 会 tree-shake 掉 —— 所以查源码而不是产物
const iconsSrc = fs.readFileSync(
  'C:/Users/lcy/Documents/Codex/2026-09-29/b-k/work/solar-card/project/src/solaria/界面/状态栏/icons.ts',
  'utf8',
);
check('备选指南针仍保留在源码里（未被引用，会被 tree-shake）', iconsSrc.includes('A 19 19 0 1 0 41 22'));

console.log('— 图标对齐规格 —');
check('六项全部改用 SVG 图标（不再有文字符号占位）', !html.includes('⌨') && !html.includes('☰'));
check('自制终端图标已内联', html.includes('M 13 15 L 15.5 15 L 20 22'));
check('图标槽由变量驱动且槽内居中（中线与文字左缘对齐）',
  cssHas('.so-nav button .icn { flex: 0 0 var(--rail-slot)') && cssHas('justify-content: center'));
check('统一渲染高度 16px（宽度按各自宽高比）',
  iconsSrc.includes("w: 17.07, h: 16") && iconsSrc.includes("w: 13.54, h: 16") && iconsSrc.includes("w: 14.05, h: 16"));
check('viewBox 已改为紧贴路径', iconsSrc.includes("box: '0.002 0.895 40.789 48.21'"));

console.log('— 目标页（第六枚图标，D27） —');
check('左栏出现「目标」入口', html.includes('>目标<') || html.includes('OBJECTIVE'));
check('目标图标 path 已内联', html.includes('35.744 33.156') && html.includes('0.603 9.766'));
check('目标页含两个分组（自设 / 委托）', html.includes('自设目标 / SELF-SET') && html.includes('接到的委托 / CONTRACTS'));
check('日志页不再承载「目标」分组（改为前情摘要）',
  html.includes('前情摘要 / RECAP') && !html.includes('目标 / OBJECTIVES'));

console.log('— 左栏收起/展开（D28） —');
check('左栏默认只露图标（宽度令牌 --rail-w，D31 精确值 82px）', cssHas('--rail-w: 82px'));
check('悬停/聚焦展开（--rail-w-open，D30 后为 204px）',
  cssHas('--rail-w-open: 204px') && cssHas('.so-nav:hover, .so-nav:focus-within'));
check('键盘可达（focus-within 同样展开）', html.includes(':focus-within'));
check('文字标签包在 .lb 里（可做滑出动画）',
  cssFlat.includes('.so-navbutton.lb') && (html.includes('"lb"') || html.includes("'lb'")));
check('手机端不收起（常驻显示文字）', /@media\(max-width:820px\)[\s\S]{0,1600}\.so-navbutton\.lb/.test(cssFlat));

console.log('— 品牌徽记：星宿联邦旗（反色，D29） —');
check('徽记 data URI 已内联进产物', html.includes('data:image/png;base64,iVBOR'));
check('徽记以 CSS mask 使用（颜色随主题走）',
  cssHas('mask-image: var(--brand-mark)') && cssHas('-webkit-mask-image: var(--brand-mark)'));
// D31：品牌不再用 justify-content:center（会在展开时跳），改为固定左内边距 17px，
// 与图标列中线 41px 对齐，且两种状态一致。
check('品牌与图标列中线对齐（固定左内边距 17px，两种状态不变）',
  cssHas('padding: 9px 12px 21px 17px') && !cssHas('.so-nav .brand { justify-content: center'));
check('展开态品牌文字滑出', cssHas('.so-nav:hover .brand-text'));
check('徽记元素存在', html.includes("'brand-mark'") || html.includes('"brand-mark"'));

console.log('— 尺寸放大（D30：图标 2×、间距 1.5×） —');
check('图标槽 38px（原 19 的 2 倍）', cssHas('--rail-slot: 38px'));
check('图标高度 32px（原 16 的 2 倍）', cssHas('--rail-icon-h: 32px'));
check('品牌徽记 48px（原 24 的 2 倍）', cssHas('--rail-mark: 48px'));
check('间距倍率 1.5：gap 3px / padding 12-13 / margin 9',
  cssHas('--rail-gap: 3px') && cssHas('--rail-btn-py: 12px')
  && cssHas('--rail-btn-px: 13px') && cssHas('--rail-btn-mx: 9px'));
check('左栏宽度随之放大（收起 84 / 展开 204）',
  cssHas('--rail-w: 82px') && cssHas('--rail-w-open: 204px'));
check('底栏小图标 2×（圆点 14px）、间距 1.5×（gap 24px）',
  cssHas('.so-foot .dot { width: 14px; height: 14px') && cssHas('.so-foot { grid-area: foot; display: flex; align-items: center; gap: 24px'));
check('图标尺寸改由 CSS 驱动（SVG 填满槽）',
  html.includes('preserveAspectRatio="xMidYMid meet"') || html.includes("'xMidYMid meet'"));
check('手机端图标退回 1×（避免七项挤不下）', /@media\(max-width:820px\)[\s\S]{0,300}--rail-icon-h:20px/.test(cssFlat));

console.log('— 导航三态与抽搐修复（D31） —');
check('三态色值就位（D9D9D9 / 858585 / 191919）',
  cssHas('--nav-off: #D9D9D9') && cssHas('--nav-hover: #858585') && cssHas('--nav-on: #191919'));
check('默认态用 --nav-off、悬停用 --nav-hover、选中用 --nav-on',
  cssHas('.so-nav button:hover { color: var(--nav-hover)') && cssHas('.so-nav button.on { color: var(--nav-on)'));
check('选中项左侧黑条紧贴页面边缘（offset = -按钮外边距）',
  cssHas('left: calc(-1 * var(--rail-btn-mx))') && cssHas('.so-nav button.on::before'));
check('不再切换 justify-content（抽搐根因已消除）',
  !cssHas('.so-nav:hover button { justify-content: flex-start') && cssHas('.so-nav button { display: flex; align-items: center; gap: 13px'));
check('品牌徽记左内边距固定 17px（与图标列中线对齐 41px）', cssHas('padding: 9px 12px 21px 17px'));

console.log('— 滚动隔离（D32） —');
check('根容器固定视口高度（不再用 min-height）',
  cssHas('.solaria-root {') && cssHas('height: 100vh; height: 100dvh') && cssHas('max-height: 100dvh')
  && !cssHas('min-height: 100vh'));
check('根容器自身不滚动（overflow: hidden）',
  /\.solaria-root\{[^}]*overflow:hidden/.test(cssFlat));
check('主区内部滚动 + min-height:0（grid 子项关键一条）',
  cssHas('.so-main { grid-area: main; position: relative; overflow: auto; min-height: 0;'));
check('左栏纵向可滚、横向裁剪标签',
  cssHas('width: var(--rail-w); overflow-x: hidden; overflow-y: auto;'));
check('地图页为空态骨架且写明复用 2080 做法', html.includes('地图 / MAP') && html.includes('百分比坐标'));

console.log('— 防污染（全屏时会克隆到酒馆顶层，绝不能有裸全局选择器） —');
const bare = styleBlocks
  .split('}')
  .map((s) => s.split('{')[0].trim())
  .filter((sel) => sel && !sel.startsWith('@') && !sel.includes('solaria-root') && !sel.startsWith(':root') && !sel.startsWith('.so-') && !sel.startsWith('from') && !sel.startsWith('to'));
check('没有裸 body / html / * 选择器', !bare.some((s) => /^(body|html|\*)/.test(s)), bare.slice(0, 5).join(' | '));

console.log('— 关键实现符号 —');
for (const sym of ['solaria-fs', 'solariaCollapse', 'getVariables', 'insertOrAssignVariables', 'generateRaw', 'same_as_preset']) {
  check(`包含 ${sym}`, html.includes(sym));
}

console.log(`\n结果：${pass} 通过 / ${fail} 失败`);
process.exit(fail === 0 ? 0 : 1);
