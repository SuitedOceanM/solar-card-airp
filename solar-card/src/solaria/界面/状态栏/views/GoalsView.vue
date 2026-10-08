<template>
  <section class="so-panel accent">
    <div class="ph">目标 / OBJECTIVE</div>
    <div class="pb">
      <div class="so-kv" style="margin-bottom:10px">
        <span class="k">这一页管</span><span class="v">我要办的事（将来）</span>
        <span class="k">与日志分工</span><span class="v">目标 = 将来；日志 = 过去</span>
        <span class="k">写入方</span><span class="v">玩家自设 或 引擎登记接到的委托</span>
      </div>
      <p style="font-size:11.5px; color:var(--so-dim); line-height:1.7; margin-bottom:12px">
        沙盒跑团最容易丢的是"我原本想干什么"。自设目标由玩家自己写，接到的委托由引擎登记，
        两者都带状态（进行中 / 搁置 / 已完成 / 已放弃），完成或放弃时进"日志"留痕。
      </p>
      <div v-for="g in 分组" :key="g.名" class="sk"
           style="opacity:.5; display:block; padding:9px 11px; margin-bottom:8px">
        <div style="font-weight:600; margin-bottom:3px">{{ g.名 }}</div>
        <div style="font-size:11.5px; color:var(--so-dim)">{{ g.说明 }}</div>
        <div style="font-size:11.5px; color:var(--so-faint); margin-top:6px">尚无条目 · M2 接入</div>
      </div>
    </div>
  </section>
</template>

<script setup>
// M1 只搭骨架；目标的字段与状态机在 M2 跟随回合管线一起定（task-breakdown T1.6/T2.1）
const 分组 = [
  { 名: '自设目标 / SELF-SET', 说明: '玩家自己立的目标：增删自由，可拆成若干小步' },
  { 名: '接到的委托 / CONTRACTS', 说明: '引擎登记：委托人 · 事由 · 报酬 · 期限 · 状态' },
];
</script>
