<template>
  <section class="so-panel">
    <div class="ph">地图 / MAP</div>
    <div class="pb">
      <div class="so-kv" style="margin-bottom:10px">
        <span class="k">当前区域</span><span class="v">{{ st.世界.地点 }}</span>
        <span class="k">时间</span><span class="v">第 {{ st.世界.日 }} 日 · {{ st.世界.时段 }}</span>
        <span class="k">在场</span><span class="v">{{ st.世界.在场.length ? st.世界.在场.join('、') : '—' }}</span>
      </div>
      <p style="font-size:11.5px; color:var(--so-dim); line-height:1.7; margin-bottom:12px">
        地图在 M2 后期接入，复用九条会那套已经验证过的做法：<b>百分比坐标 + 多边形分区 + 图钉</b>
        （我们移植 2080 那套地图时踩过的坑都记在案）。索拉利亚用七层结构当骨架——
        外层是 GAIA 地表，越往下越接近地心的"索拉"。
      </p>
      <div class="so-grid c2">
        <div v-for="g in 分组" :key="g.名" class="sk" style="opacity:.5; display:block; padding:8px 10px">
          <div style="font-weight:600; margin-bottom:3px">{{ g.名 }}</div>
          <div style="font-size:11.5px; color:var(--so-dim)">{{ g.说明 }}</div>
          <div style="font-size:11.5px; color:var(--so-faint); margin-top:6px">待接入 · M2 后期</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { state as st } from '../store';

// M1 只搭骨架；分层与坐标数据在 M2 后期随 T4.4 接入
const 分组 = [
  { 名: '分层 / LAYERS', 说明: 'GAIA → ASIA → OCEANIA → ANTARCTICA → AMERICA → AFRICA → EUROPA' },
  { 名: '当前位置 / POSITION', 说明: '我在哪一层、哪座城，周围的人与威胁' },
  { 名: '已知地点 / KNOWN', 说明: '到过的地点与道听途说的地点分开呈现' },
  { 名: '探索度 / EXPLORED', 说明: '每层解锁比例，配合"资料"页的收集进度' },
];
</script>
