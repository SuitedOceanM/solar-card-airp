<template>
  <section class="so-panel accent">
    <div class="ph">输入 / INPUT</div>
    <div class="pb">
      <div class="so-field">
        <label>行动输入（M1 只验证链路，不接玩法）</label>
        <textarea v-model="input" rows="3" placeholder="例如：我推开通往仓储区的门"></textarea>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">
        <button class="so-btn primary" :disabled="busy || !genReady" @click="onGenerate">
          {{ busy ? '生成中…' : '生成测试' }}
        </button>
        <button class="so-btn" @click="onClear">清屏</button>
      </div>
      <p style="margin-top:8px;font-size:11.5px;color:var(--so-faint);line-height:1.6">
        生成走「当前酒馆预设（main / nsfw / jailbreak / 文风）+ 本卡系统提示 → generateRaw」，
        采样参数用 same_as_preset。若这里能出正文，说明正文链路已通。
        存档与读档已移到「设置」（设置页同时承载存档界面）。
      </p>
    </div>
  </section>

  <section class="so-panel">
    <div class="ph">输出 / OUTPUT</div>
    <div class="pb">
      <div v-if="lastText" class="so-term" style="border-left:3px solid var(--so-accent)">{{ lastText }}</div>
      <div class="so-term" :style="lastText ? 'margin-top:8px' : ''">
        <div v-for="(l, i) in st.记录.slice(-40)" :key="i">{{ l }}</div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import { generateNarrative } from '../ai';
import { pushLog, state as st } from '../store';

const input = ref('我推开通往仓储区的门。');
const lastText = ref('');
const busy = ref(false);

async function onGenerate() {
  busy.value = true;
  lastText.value = '';
  pushLog(`发起生成：${input.value.slice(0, 40)}`);
  const r = await generateNarrative(input.value);
  pushLog(r.msg);
  if (r.ok) {
    lastText.value = r.text;
    st.资源.暴露度 = Math.min(100, st.资源.暴露度);
  } else {
    lastText.value = '';
  }
  busy.value = false;
}

function onClear() {
  st.记录.splice(0, st.记录.length);
  lastText.value = '';
}
</script>
