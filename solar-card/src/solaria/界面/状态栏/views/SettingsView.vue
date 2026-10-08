<template>
  <!-- 存档（与设置共用同一枚图标；原终端页的存取按钮全部并到这里） -->
  <section class="so-panel accent">
    <div class="ph">存档 / SAVE</div>
    <div class="pb">
      <div class="so-kv" style="margin-bottom:10px">
        <span class="k">存储位置</span><span class="v">当前聊天的 chat 变量 · solaria</span>
        <span class="k">存档状态</span>
        <span class="v" :style="{ color: toggleOK ? 'var(--so-green)' : 'var(--so-red)' }">
          {{ toggleOK ? '接口可用' : '接口不可用（需在酒馆内运行）' }}
        </span>
        <span class="k">最近操作</span><span class="v">{{ lastOp }}</span>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        <button class="so-btn primary" @click="onSave">保存到当前聊天</button>
        <button class="so-btn" @click="onLoad">从当前聊天读取</button>
        <button class="so-btn" @click="onReset">新建档（重置）</button>
        <button class="so-btn" @click="onCopy">复制状态 JSON</button>
      </div>
      <p style="margin-top:8px;font-size:11.5px;color:var(--so-faint);line-height:1.6">
        多存档 = 多开聊天。自动存档、槽位与导出/导入在 M2 接入（决策 D14/D6）。
      </p>
      <div style="margin-top:10px">
        <div style="font-size:11px;color:var(--so-dim);letter-spacing:1px;margin-bottom:4px">当前状态 JSON（只读预览）</div>
        <pre class="so-term" style="max-height:26vh">{{ json }}</pre>
      </div>
    </div>
  </section>

  <section class="so-panel">
    <div class="ph">尺度 / CONTENT SCALES（两个独立量表）</div>
    <div class="pb">
      <div class="so-grid c2">
        <div class="so-field">
          <label>NSFW</label>
          <select v-model="st.尺度.nsfw">
            <option value="克制">克制（暗示 / 淡出 / 事后提及）</option>
            <option value="直白">直白（可有直接描写）</option>
          </select>
        </div>
        <div class="so-field">
          <label>直白暴力</label>
          <select v-model="st.尺度.暴力">
            <option value="克制">克制（血腥点到为止）</option>
            <option value="直白">直白（血腥 / 致残 / 处决 / 酷刑）</option>
          </select>
        </div>
      </div>
      <p style="margin-top:8px;font-size:11.5px;color:var(--so-faint);line-height:1.6">
        两个量表独立生效；即使在"直白"档，仍保留逐项跳过/淡出（M2 接入提示词与设定路由）。
      </p>
    </div>
  </section>

  <section class="so-panel">
    <div class="ph">副 API / BACKGROUND API（后台任务用：数值抽取 · 前情总结）</div>
    <div class="pb">
      <div class="so-grid c2">
        <div class="so-field"><label>启用</label>
          <select v-model="sub.enabled">
            <option :value="false">关闭（后台任务跟随主 API）</option>
            <option :value="true">开启</option>
          </select>
        </div>
        <div class="so-field"><label>模型</label><input v-model="sub.model" placeholder="例如 gpt-4o-mini" /></div>
        <div class="so-field"><label>接口地址</label><input v-model="sub.apiurl" placeholder="https://…/v1" /></div>
        <div class="so-field"><label>密钥</label><input v-model="sub.key" type="password" placeholder="仅存在本地 localStorage" /></div>
      </div>
      <div style="margin-top:8px;display:flex;gap:6px">
        <button class="so-btn primary" @click="onSaveApi">保存副 API</button>
        <button class="so-btn" @click="onSave">保存存档</button>
      </div>
      <p style="margin-top:8px;font-size:11.5px;color:var(--so-faint);line-height:1.6">
        M1 只保存配置，不发起后台任务。依据：pellucid 的"正文走预设 / 后台走副 API"分离。
      </p>
    </div>
  </section>

  <section class="so-panel">
    <div class="ph">构建 / BUILD</div>
    <div class="pb">
      <div class="so-kv">
        <span class="k">版本</span><span class="v">{{ BUILD_VERSION }}</span>
        <span class="k">阶段</span><span class="v">{{ BUILD_STAGE }}</span>
        <span class="k">视觉</span><span class="v">{{ THEME_RULE }}</span>
        <span class="k">基线</span><span class="v">pellucid-grove@5455ec0</span>
        <span class="k">存档键</span><span class="v">chat 变量 · solaria</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import { BUILD_STAGE, BUILD_VERSION, THEME_RULE } from '../version';
import { getSubApi, setSubApi } from '../ai';
import { hasTavernVars, loadFromChat, pushLog, resetState, saveToChat, state as st } from '../store';

const sub = reactive(getSubApi());
const json = computed(() => JSON.stringify(st, null, 1));
const toggleOK = hasTavernVars();
const lastOp = ref('—');

function onSaveApi() {
  setSubApi({ enabled: !!sub.enabled, apiurl: sub.apiurl, key: sub.key, model: sub.model });
  pushLog(sub.enabled ? '副 API 配置已保存（启用）' : '副 API 配置已保存（关闭）');
}
function onSave() {
  const r = saveToChat();
  lastOp.value = `保存 · ${new Date().toLocaleTimeString()} · ${r.ok ? '成功' : '失败'}`;
  pushLog(r.msg);
}
function onLoad() {
  const r = loadFromChat();
  lastOp.value = `读取 · ${new Date().toLocaleTimeString()} · ${r.ok ? '成功' : '失败'}`;
  pushLog(r.msg);
}
function onReset() {
  resetState(st.人物.姓名);
  lastOp.value = `新建档 · ${new Date().toLocaleTimeString()}`;
  pushLog('已重置为初始状态（M2 会换成创建向导产出）');
}
async function onCopy() {
  try {
    await navigator.clipboard.writeText(json.value);
    lastOp.value = `复制 JSON · ${new Date().toLocaleTimeString()} · 成功`;
    pushLog('状态 JSON 已复制到剪贴板');
  } catch (e) {
    lastOp.value = '复制失败（浏览器未授权剪贴板）';
    pushLog('复制失败：' + String(e));
  }
}
</script>
