<template>
  <div class="solaria-root">
    <!-- 左导航（白底黑字，选中 = 浅灰块；品牌挂在栏首，不再占用顶栏） -->
    <nav class="so-nav" :style="{ '--brand-mark': `url(${BRAND_MARK})` }">
      <div class="brand">
        <span class="brand-mark" :title="BRAND_NOTE"></span>
        <span class="brand-text">索拉利亚<i>SOLARIA</i></span>
      </div>
      <button v-for="v in views" :key="v.key" :class="{ on: view === v.key }" @click="view = v.key">
        <span class="icn"><Icon :d="v.icon.d" :viewBox="v.icon.box" /></span>
        <span class="lb">{{ v.label }}</span>
      </button>
    </nav>

    <!-- 主区：页头 = `// LATIN` + 大号中文标题 -->
    <main class="so-main">
      <div class="so-page">
        <div class="kicker">// {{ currentView.latin }}</div>
        <h1>{{ currentView.label }}</h1>
      </div>
      <TerminalView v-if="view === '终端'" />
      <ArchiveView v-else-if="view === '档案'" />
      <GoalsView v-else-if="view === '目标'" />
      <DataView v-else-if="view === '资料'" />
      <LogView v-else-if="view === '日志'" />
      <MapView v-else-if="view === '地图'" />
      <SettingsView v-else-if="view === '设置'" />
    </main>

    <!-- 底部状态栏：原顶栏的身份/时间/地点信息搬到这里（黑条白字） -->
    <footer class="so-foot">
      <span class="brand">索拉利亚</span>
      <span class="sep">|</span>
      <span class="cell"><span class="k">姓名</span><span class="v">{{ st.人物.姓名 }}</span></span>
      <span class="cell"><span class="k">支族</span><span class="v">{{ st.人物.支族 }}</span></span>
      <span class="cell"><span class="k">DAY</span><span class="v hi">{{ st.世界.日 }}</span></span>
      <span class="cell"><span class="k">时段</span><span class="v">{{ st.世界.时段 }}</span></span>
      <span class="cell"><span class="k">位置</span><span class="v">{{ st.世界.地点 }}</span></span>
      <span class="sep">|</span>
      <span class="cell"><span class="k">HP</span><span class="v">{{ st.资源.生命 }}/{{ st.资源.生命上限 }}</span></span>
      <span class="cell"><span class="k">源质</span><span class="v">{{ st.资源.源质 }}/{{ st.资源.源质上限 }}</span></span>
      <span class="cell"><span class="k">带宽</span><span class="v">{{ st.资源.带宽 }}/{{ st.资源.带宽上限 }}</span></span>
      <span class="cell">
        <span class="k">暴露度</span>
        <span class="v" :style="{ color: st.资源.暴露度 > 50 ? 'var(--so-red)' : '#EDEDED' }">{{ st.资源.暴露度 }}</span>
      </span>
      <span class="sep">|</span>
      <span class="dot" :class="{ bad: !varsReady }"></span>
      <span class="cell"><span class="v">{{ varsReady ? 'CHAT-VARS' : 'CHAT-VARS N/A' }}</span></span>
      <span class="dot" :class="{ bad: !genReady }"></span>
      <span class="cell"><span class="v">{{ genReady ? 'GEN' : 'GEN N/A' }}</span></span>
      <span class="right">
        <span>{{ BUILD_VERSION }}</span>
        <button class="exit" @click="onExit">退出</button>
      </span>
    </footer>
  </div>
</template>

<script setup>
import { computed, inject, ref } from 'vue';
import { BUILD_STAGE, BUILD_VERSION } from './version';
import { hasTavernVars, loadFromChat, pushLog, state as st } from './store';
import { hasGeneration } from './ai';
import Icon from './components/Icon.vue';
import { ICONS } from './icons';
import { BRAND_MARK, BRAND_NOTE } from './brand';
import TerminalView from './views/TerminalView.vue';
import ArchiveView from './views/ArchiveView.vue';
import GoalsView from './views/GoalsView.vue';
import DataView from './views/DataView.vue';
import LogView from './views/LogView.vue';
import MapView from './views/MapView.vue';
import SettingsView from './views/SettingsView.vue';

const views = [
  { key: '终端', icon: ICONS.terminal, label: '终端', latin: 'TERMINAL' },
  // 档案（个人档案，替代原「干员」）——ID 卡图标
  { key: '档案', icon: ICONS.archive, label: '档案', latin: 'ARCHIVE' },
  // 目标（将来）= 自设目标 + 接到的委托；与「日志」（过去）成对
  { key: '目标', icon: ICONS.goals, label: '目标', latin: 'OBJECTIVE' },
  // 资料（世界观档案）——第三枚图标
  { key: '资料', icon: ICONS.data, label: '资料', latin: 'DATA' },
  // 日志（原提案的"关系/日志"独立页）——目标 / 事件线 / 人物 / 大事记
  { key: '日志', icon: ICONS.log, label: '日志', latin: 'LOG' },
  // 地图（折叠地图，按用户给的参考形状重画；备选指南针见 icons.ts 的 ICON_COMPASS）
  { key: '地图', icon: ICONS.map, label: '地图', latin: 'MAP' },
  // 设置页同时承载「存档」——两者共用同一枚图标（用户指定）
  { key: '设置', icon: ICONS.settings, label: '设置', latin: 'SETTINGS' },
];
const view = ref('终端');
const currentView = computed(() => views.find((v) => v.key === view.value) ?? views[0]);
const varsReady = hasTavernVars();
const genReady = hasGeneration();

// 被全屏宿主 provide 进来的收起函数（在酒馆里点"退出"就隐藏宿主回酒馆）
const collapse = inject('solariaCollapse', null);

// 展开时自动尝试读档一次（存在就恢复，不存在就保持初始态）
const loaded = loadFromChat();
pushLog(loaded.found ? loaded.msg : (loaded.ok ? '未发现存档，按初始状态启动' : loaded.msg));

function onExit() {
  if (typeof collapse === 'function') collapse();
  else pushLog('退出：当前不在酒馆全屏宿主内');
}
</script>
