/* 图标对齐计算器：
   问题：五枚图标 viewBox 各不同（41×50 / 44×49 / 42×42 / 42×40 / 44×44），
        再各给一套 w/h，结果**渲染出来的实际大小和纵向基线都在飘**。
   方案：① 每枚都换算成**紧贴路径的 viewBox**；② 统一渲染高度 = 16px；
        ③ 左栏给图标一个**固定槽宽**，槽内居中 → 文字左边缘也就对齐了。
*/

// 各图标的紧包围盒（由路径坐标算得 / 实测）
const icons = {
  save: { box: [0.002, 0.895, 40.789, 48.21], 注: '用户提供：存档/设置' },
  archive: { box: [0.941, 0.506, 42.117, 47.964], 注: '用户提供：个人档案' },
  data: { box: [0.173, 0.188, 41.718, 41.647], 注: '用户提供：资料' },
  log: { box: [-0.002, -0.008, 42.016, 40.018], 注: '用户提供：日志' },
  map: { box: [6, 7, 32, 30], 注: '自制：折叠地图（本版尺寸）' },
  terminal: { box: [6, 7, 32, 30], 注: '自制：终端（补上原来用文字符号的那一项）' },
};

const H = 16; // 统一渲染高度
console.log('统一渲染高度 =', H, 'px\n');
console.log('name'.padEnd(10), '紧 viewBox'.padEnd(30), 'w×h'.padEnd(12), '宽高比');
const rows = {};
for (const [k, v] of Object.entries(icons)) {
  const [x, y, w, h] = v.box;
  const ratio = w / h;
  const rw = Math.round(H * ratio * 100) / 100;
  rows[k] = { viewBox: `${x} ${y} ${w} ${h}`, w: rw, h: H };
  console.log(k.padEnd(10), `${x} ${y} ${w} ${h}`.padEnd(30), `${rw} × ${H}`.padEnd(12), ratio.toFixed(3));
}

const maxW = Math.max(...Object.values(rows).map((r) => r.w));
console.log('\n最大宽度 =', maxW.toFixed(2), '→ 左栏图标槽宽建议 =', Math.ceil(maxW + 1), 'px（槽内居中）');
console.log('这样：所有图标纵向中线一致、渲染高度一致、文字左边缘一致。');
