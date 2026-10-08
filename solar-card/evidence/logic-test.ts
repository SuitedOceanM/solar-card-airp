/* M1 状态层真测试（不需要浏览器）：
   跑法：在 project 下执行 pnpm exec ts-node --compilerOptions {"module":"commonjs"} <本文件> */
import {
  属性表, 技能表, 技能清单, 技能键, 属性上限常规, 属性上限突破, 技能上限,
  createInitialState, clampState, STATE_VERSION,
} from './state.ts';

let pass = 0;
let fail = 0;
const check = (name: string, cond: boolean, extra = ''): void => {
  if (cond) { pass += 1; console.log(`  ✓ ${name}`); }
  else { fail += 1; console.log(`  ✗ ${name} ${extra}`); }
};

console.log('— 结构 —');
check('属性 7 项', 属性表.length === 7, `实际 ${属性表.length}`);
check('每属性 3 条技能线', 属性表.every((a) => 技能表[a].length === 3));
check('技能合计 21 项', 技能清单.length === 21, `实际 ${技能清单.length}`);
check('技能键格式正确', 技能键('源质', '施法') === '源质·施法');
check('上限常量 20 / 25 / 5', 属性上限常规 === 20 && 属性上限突破 === 25 && 技能上限 === 5);

console.log('— 初始状态 —');
const s0 = createInitialState('测试员');
check('版本号写入', s0.版本 === STATE_VERSION);
check('属性初始 8', 属性表.every((a) => s0.属性[a] === 8));
check('技能初始 0 且 21 项', Object.keys(s0.技能).length === 21 && Object.values(s0.技能).every((v) => v === 0));
check('资源满值', s0.资源.生命 === s0.资源.生命上限 && s0.资源.源质 === s0.资源.源质上限);
check('尺度默认克制', s0.尺度.nsfw === '克制' && s0.尺度.暴力 === '克制');

console.log('— 钳制（脏数据不得让它崩） —');
const dirty = {
  人物: { 姓名: 123, 支族: null, 年龄: 'x' },
  属性: { 体魄: 999, 专注: -50, 源质: '30', 不存在: 7 },
  技能: { '源质·施法': 99, '体魄·力量': -3, 乱写: 5 },
  资源: { 生命: 999999, 生命上限: 80, 暴露度: 250, 源质: -10 },
  尺度: { nsfw: '乱写', 暴力: '直白' },
  世界: { 日: 0, 在场: ['A', 1, 'B', null] },
  记录: 'not-an-array',
};
const c = clampState(dirty);
check('属性上限钳到 25', c.属性.体魄 === 25, `实际 ${c.属性.体魄}`);
check('属性下限钳到 0', c.属性.专注 === 0, `实际 ${c.属性.专注}`);
check('数字字符串被接受', c.属性.源质 === 25, `实际 ${c.属性.源质}`); // '30' → 25
check('技能上限钳到 5', c.技能['源质·施法'] === 5, `实际 ${c.技能['源质·施法']}`);
check('技能下限钳到 0', c.技能['体魄·力量'] === 0);
check('未知字段被丢弃', !('不存在' in c.属性) && !('乱写' in c.技能));
check('生命不超过上限', c.资源.生命 === 80, `实际 ${c.资源.生命}`);
check('暴露度钳到 100', c.资源.暴露度 === 100);
check('源质不为负', c.资源.源质 === 0);
check('非法尺度回落到克制', c.尺度.nsfw === '克制' && c.尺度.暴力 === '直白');
check('日下限 1', c.世界.日 === 1);
check('在场只留字符串', c.世界.在场.length === 2 && c.世界.在场.join() === 'A,B');
check('记录非数组时回落空数组', Array.isArray(c.记录) && c.记录.length === 0);
check('姓名非法时回落默认', c.人物.姓名 === '未命名', `实际 ${c.人物.姓名}`);
check('再钳制一次结果稳定（幂等）', JSON.stringify(clampState(c)) === JSON.stringify(c));

console.log(`\n结果：${pass} 通过 / ${fail} 失败`);
process.exit(fail === 0 ? 0 : 1);


