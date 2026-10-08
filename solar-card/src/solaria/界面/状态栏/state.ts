/* ============================================================
 * 索拉利亚 · 状态结构与取值规则（唯一事实来源）
 * 结构依据：systems-design §2/§3
 *   属性 7 项（各 0–20，芯片/古代遗物可达 25）× 技能 21 项（7×3，各 0–5）
 * 说明：M1 只落"结构 + 钳制 + 默认值"，玩法数值在 M2 才接。
 * ============================================================ */

export const 属性表 = ['体魄', '专注', '智力', '技术', '口才', '战斗', '源质'] as const;
export type 属性名 = (typeof 属性表)[number];

export const 技能表: Record<属性名, readonly string[]> = {
  体魄: ['力量', '耐力', '韧性'],
  专注: ['感知', '意志', '反应'],
  智力: ['分析', '知识', '策略'],
  技术: ['工程', '网络', '医疗'],
  口才: ['交涉', '统御', '欺骗'],
  战斗: ['射击', '格斗', '战术'],
  源质: ['施法', '感应', '操作'],
};

/** 21 项技能：`属性·技能` 的扁平清单，UI 与 schema 都用它 */
export const 技能清单: { 属性: 属性名; 技能: string }[] = 属性表.flatMap((a) =>
  技能表[a].map((s) => ({ 属性: a, 技能: s })),
);

/** 上限：常规 20，芯片/古代遗物可破到 25（见 systems-design §2） */
export const 属性上限常规 = 20;
export const 属性上限突破 = 25;
export const 技能上限 = 5;

export type 尺度档 = '克制' | '直白';

export interface SoliariaState {
  版本: number;
  人物: {
    姓名: string;
    支族: string;
    年龄: number;
    简介: string;
  };
  属性: Record<属性名, number>;
  技能: Record<string, number>; // key = `属性·技能`
  资源: {
    生命: number;
    生命上限: number;
    护甲: number;
    源质: number;
    源质上限: number;
    带宽: number;
    带宽上限: number;
    暴露度: number;
    负荷: number;
  };
  尺度: {
    nsfw: 尺度档;
    暴力: 尺度档;
  };
  世界: {
    日: number;
    时段: string;
    地点: string;
    在场: string[];
  };
  记录: string[]; // M1 的简易日志（每行一条）
}

export const STATE_VERSION = 1;

/** 技能 key 约定：`属性·技能` */
export const 技能键 = (属性: 属性名, 技能: string): string => `${属性}·${技能}`;

export function createInitialState(姓名 = '未命名'): SoliariaState {
  const 属性 = {} as Record<属性名, number>;
  for (const a of 属性表) 属性[a] = 8; // 平民 5–8 / 受训 9–12 的起点
  const 技能: Record<string, number> = {};
  for (const { 属性: a, 技能: s } of 技能清单) 技能[技能键(a, s)] = 0;
  return {
    版本: STATE_VERSION,
    人物: { 姓名, 支族: '人类种', 年龄: 20, 简介: '' },
    属性,
    技能,
    资源: { 生命: 100, 生命上限: 100, 护甲: 4, 源质: 60, 源质上限: 60, 带宽: 6, 带宽上限: 6, 暴露度: 0, 负荷: 0 },
    尺度: { nsfw: '克制', 暴力: '克制' },
    世界: { 日: 1, 时段: '昼', 地点: '未标定', 在场: [] },
    记录: [],
  };
}

const 夹 = (v: unknown, lo: number, hi: number, fallback: number): number => {
  const n = typeof v === 'number' && Number.isFinite(v) ? v : Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(lo, Math.min(hi, Math.round(n)));
};

const 文本 = (v: unknown, fallback = ''): string => (typeof v === 'string' ? v : fallback);

/**
 * 校验 + 钳制 + 补缺：任何来源（旧存档 / 手改 / 模型写入）都必须过这道闸。
 * 这里刻意不用 zod——TH 前端 iframe 里 zod 是宿主全局 `z`，不保证一定有；
 * 先用确定性钳制保证"永不崩"，等 M2 接 schema 校验时再叠加（见 decisions D6）。
 */
export function clampState(raw: unknown): SoliariaState {
  const base = createInitialState();
  const s = (raw && typeof raw === 'object' ? raw : {}) as Partial<SoliariaState>;

  const 人物 = (s.人物 ?? {}) as Partial<SoliariaState['人物']>;
  base.人物 = {
    姓名: 文本(人物.姓名, base.人物.姓名) || '未命名',
    支族: 文本(人物.支族, base.人物.支族),
    年龄: 夹(人物.年龄, 1, 9999, base.人物.年龄),
    简介: 文本(人物.简介, ''),
  };

  const 属性入 = (s.属性 ?? {}) as Record<string, unknown>;
  for (const a of 属性表) base.属性[a] = 夹(属性入[a], 0, 属性上限突破, base.属性[a]);

  const 技能入 = (s.技能 ?? {}) as Record<string, unknown>;
  for (const { 属性: a, 技能: sk } of 技能清单) {
    const k = 技能键(a, sk);
    base.技能[k] = 夹(技能入[k], 0, 技能上限, 0);
  }

  const 资源入 = (s.资源 ?? {}) as Record<string, unknown>;
  const 上限 = (k: string, def: number): number => 夹(资源入[k], 1, 999999, def);
  base.资源.生命上限 = 上限('生命上限', base.资源.生命上限);
  base.资源.生命 = 夹(资源入.生命, 0, base.资源.生命上限, base.资源.生命上限);
  base.资源.护甲 = 夹(资源入.护甲, 0, 999, base.资源.护甲);
  base.资源.源质上限 = 上限('源质上限', base.资源.源质上限);
  base.资源.源质 = 夹(资源入.源质, 0, base.资源.源质上限, base.资源.源质上限);
  base.资源.带宽上限 = 上限('带宽上限', base.资源.带宽上限);
  base.资源.带宽 = 夹(资源入.带宽, 0, base.资源.带宽上限, base.资源.带宽上限);
  base.资源.暴露度 = 夹(资源入.暴露度, 0, 100, 0);
  base.资源.负荷 = 夹(资源入.负荷, 0, 999, 0);

  const 尺度入 = (s.尺度 ?? {}) as Partial<SoliariaState['尺度']>;
  base.尺度 = {
    nsfw: 尺度入.nsfw === '直白' ? '直白' : '克制',
    暴力: 尺度入.暴力 === '直白' ? '直白' : '克制',
  };

  const 世界入 = (s.世界 ?? {}) as Partial<SoliariaState['世界']>;
  base.世界 = {
    日: 夹(世界入.日, 1, 999999, 1),
    时段: 文本(世界入.时段, '昼') || '昼',
    地点: 文本(世界入.地点, '未标定') || '未标定',
    在场: Array.isArray(世界入.在场) ? 世界入.在场.filter((x): x is string => typeof x === 'string').slice(0, 32) : [],
  };

  base.记录 = Array.isArray(s.记录) ? s.记录.filter((x): x is string => typeof x === 'string').slice(-200) : [];
  base.版本 = STATE_VERSION;
  return base;
}
