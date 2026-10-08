/* ============================================================
 * 索拉利亚 · 状态存取
 * 存储：酒馆助手 chat 作用域变量（type:'chat'）——多存档 = 多开聊天。
 * 决策依据：D6「chat 变量 + 前端自建校验，不引 MVU」（骰面/生命/RAM 必须由代码确定性写入）
 * ============================================================ */
import { reactive } from 'vue';
import { clampState, createInitialState, type SoliariaState } from './state';

/** 在 chat 变量里占用的键名 */
export const CHAT_KEY = 'solaria';

const G = globalThis as any;

export function hasTavernVars(): boolean {
  return typeof G.getVariables === 'function' && typeof G.insertOrAssignVariables === 'function';
}

export const state = reactive<SoliariaState>(createInitialState());

export function replaceState(next: SoliariaState): void {
  Object.assign(state, next);
}

/** 从当前聊天读取存档；没有则返回 null（由调用方决定是否建档） */
export function loadFromChat(): { ok: boolean; msg: string; found: boolean } {
  if (!hasTavernVars()) return { ok: false, found: false, msg: '酒馆助手变量接口不可用（需在酒馆内运行）' };
  try {
    const store = G.getVariables({ type: 'chat' }) as Record<string, unknown> | null;
    const raw = store ? store[CHAT_KEY] : undefined;
    if (raw === undefined || raw === null) return { ok: true, found: false, msg: '当前聊天还没有存档' };
    replaceState(clampState(raw));
    return { ok: true, found: true, msg: `已读档：${state.人物.姓名} · ${state.人物.支族} · 第 ${state.世界.日} 日` };
  } catch (e) {
    return { ok: false, found: false, msg: '读档失败：' + String(e) };
  }
}

/** 写入当前聊天 */
export function saveToChat(): { ok: boolean; msg: string } {
  if (!hasTavernVars()) return { ok: false, msg: '酒馆助手变量接口不可用（需在酒馆内运行）' };
  try {
    const payload = clampState(JSON.parse(JSON.stringify(state)));
    G.insertOrAssignVariables({ [CHAT_KEY]: payload }, { type: 'chat' });
    return { ok: true, msg: `已存档（${new Date().toLocaleTimeString()}）` };
  } catch (e) {
    return { ok: false, msg: '存档失败：' + String(e) };
  }
}

/** 重置为初始状态（M1 的"新建档"，M2 会换成创建向导产出） */
export function resetState(姓名 = '未命名'): void {
  replaceState(createInitialState(姓名));
}

/** 往状态里追加一条日志（M1 用它显示操作回执） */
export function pushLog(line: string): void {
  const ts = new Date().toLocaleTimeString();
  state.记录.push(`[${ts}] ${line}`);
  if (state.记录.length > 200) state.记录.splice(0, state.记录.length - 200);
}
