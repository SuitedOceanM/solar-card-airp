/* ============================================================
 * 索拉利亚 · 生成链路（M1：证明"正文走酒馆预设"这条链路是通的）
 * 依据 pellucid-grove@5455ec0 的 tavern-ai.ts 做法：
 *   ① 取当前在用的酒馆预设里 main / nsfw / jailbreak / 文风 类条目，拼在 ordered_prompts 前面
 *   ② 用 generateRaw 发一次非流式请求，custom_api 用 'same_as_preset'（采样参数继续吃预设）
 *   ③ 后台任务（数值抽取 / 总结）将来走副 API —— M1 先把副 API 配置位留出来
 * ============================================================ */

const G = globalThis as any;

export interface PromptMsg { role: string; content: string }

export function hasGeneration(): boolean {
  return typeof G.generateRaw === 'function';
}

/** 当前预设里值得带进游戏的条目 */
export function currentPresetPrompts(): PromptMsg[] {
  try {
    const preset = typeof G.getPreset === 'function' ? G.getPreset('in_use') : null;
    const list = preset?.prompts;
    if (!Array.isArray(list)) return [];
    return list
      .filter((p: any) => p && p.enabled && typeof p.content === 'string' && p.content.trim())
      .filter((p: any) => ['main', 'nsfw', 'jailbreak'].includes(String(p.id)) || /文风|风格|style/i.test(String(p.name ?? '')))
      .map((p: any) => ({ role: String(p.role ?? 'system'), content: String(p.content) }));
  } catch {
    return [];
  }
}

/** 副 API 配置（后台任务用；M1 只存不调） */
export interface SubApiConfig { enabled: boolean; apiurl: string; key: string; model: string }
const SUB_API_KEY = 'solaria_sub_api';

export function getSubApi(): SubApiConfig {
  try {
    const raw = localStorage.getItem(SUB_API_KEY);
    if (!raw) return { enabled: false, apiurl: '', key: '', model: '' };
    const o = JSON.parse(raw) as Partial<SubApiConfig>;
    return {
      enabled: !!o.enabled,
      apiurl: typeof o.apiurl === 'string' ? o.apiurl : '',
      key: typeof o.key === 'string' ? o.key : '',
      model: typeof o.model === 'string' ? o.model : '',
    };
  } catch {
    return { enabled: false, apiurl: '', key: '', model: '' };
  }
}

export function setSubApi(cfg: SubApiConfig): void {
  try { localStorage.setItem(SUB_API_KEY, JSON.stringify(cfg)); } catch { /* ignore */ }
}

export interface GenerateResult { ok: boolean; text: string; msg: string; t0: number; ms: number }

/**
 * 走"当前预设 + 本卡系统提示"生成一段正文。
 * M1 的系统提示很薄（只交代身份与尺度档），玩法提示词在 M2 接入。
 */
export async function generateNarrative(userInput: string, systemExtra = ''): Promise<GenerateResult> {
  const t0 = Date.now();
  if (!hasGeneration()) {
    return { ok: false, text: '', msg: '酒馆助手 generateRaw 不可用（需在酒馆内运行）', t0, ms: 0 };
  }
  const ordered: PromptMsg[] = [
    ...currentPresetPrompts(),
    { role: 'system', content: systemExtra || '你是一段沙盒跑团的叙事引擎。用中文写作，只输出正文，不要解释自己。' },
    { role: 'user', content: userInput },
  ];
  try {
    const text = await G.generateRaw({
      ordered_prompts: ordered,
      should_stream: false,
      custom_api: { temperature: 'same_as_preset', top_p: 'same_as_preset', max_tokens: 'same_as_preset' },
    });
    const ms = Date.now() - t0;
    return { ok: true, text: typeof text === 'string' ? text : String(text ?? ''), msg: `生成完成（${ms} ms）`, t0, ms };
  } catch (e) {
    return { ok: false, text: '', msg: '生成失败：' + String(e), t0, ms: Date.now() - t0 };
  }
}
