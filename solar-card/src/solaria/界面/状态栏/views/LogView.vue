<template>
  <section class="so-panel">
    <div class="ph">日志 / LOG</div>
    <div class="pb">
      <div class="so-kv" style="margin-bottom:10px">
        <span class="k">记录什么</span><span class="v">目标 · 事件线 · 遇到的人 · 大事记</span>
        <span class="k">谁来写</span><span class="v">引擎在每回合写回时追加（不是模型自由发挥）</span>
        <span class="k">与资料的分工</span><span class="v">资料 = 世界是什么；日志 = 我经历了什么</span>
      </div>
      <p style="font-size:11.5px; color:var(--so-dim); line-height:1.7; margin-bottom:12px">
        沙盒跑团最容易丢的是"我原本想干什么"。这一页就是给玩家留的锚：
        目标（自己立的）、事件线（在发酵的）、遇到的人、以及一条按时间排的大事记。
      </p>
      <div class="so-grid c2">
        <div v-for="g in 分组" :key="g.名" class="sk" style="opacity:.5; display:block; padding:8px 10px">
          <div style="font-weight:600; margin-bottom:3px">{{ g.名 }}</div>
          <div style="font-size:11.5px; color:var(--so-dim)">{{ g.说明 }}</div>
          <div style="font-size:11.5px; color:var(--so-faint); margin-top:6px">尚无记录 · M2 接入</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
// M1 只搭骨架：四个分组的写入时机与字段在 M2 跟随回合管线一起定（见 task-breakdown T1.6/T2.1）
// 注：原「目标」分组已并入独立的「目标」页（目标 = 将来 / 日志 = 过去），
// 这里第四格改为「前情摘要」——它是记忆层（proseArchive / eventSummaries）的可读视图。
const 分组 = [
  { 名: '事件线 / THREADS', 说明: '正在发酵的事件与期限，对应世界侧每回合推进' },
  { 名: '人物 / CONTACTS', 说明: '遇到过的人：关系、立场、最后出现的位置' },
  { 名: '大事记 / CHRONICLE', 说明: '按日排序的关键节点，长跑时用来回忆' },
  { 名: '前情摘要 / RECAP', 说明: '记忆层的可读视图：时期概要 + 近期事件总结' },
];
</script>
