<template>
  <section class="so-panel">
    <div class="ph">世界观档案 / DATA</div>
    <div class="pb">
      <div class="so-kv" style="margin-bottom:10px">
        <span class="k">收录方式</span><span class="v">探索到 / 听过 / 打过 → 才会入册（解锁制）</span>
        <span class="k">当前进度</span><span class="v">0 / {{ 待收录.length }} 类</span>
        <span class="k">数据来源</span><span class="v">世界书 provider（暂缓，见决策 D5）</span>
      </div>
      <p style="font-size:11.5px; color:var(--so-dim); line-height:1.7; margin-bottom:10px">
        这一页不做成"可以随便翻的百科"，而做成收集品：沙盒跑团里玩家自己挣来的世界观才有分量，
        也顺带解决了 19.6 万字世界书"怎么给玩家看"的问题——不让他翻，让他自己去遇上。
      </p>
      <div class="so-skills">
        <div v-for="c in 待收录" :key="c" class="sk" style="opacity:.45">
          <span class="n">{{ c }}</span>
          <span class="lv zero">未解锁</span>
        </div>
      </div>
      <p style="font-size:11.5px; color:var(--so-faint); line-height:1.6; margin-top:10px">
        M3 随世界书接入后填充（决策 D5）：七层结构、十二支族、势力机关、旧网与遗迹……
        每类条目解锁后在这里展开详情。
      </p>
    </div>
  </section>
</template>

<script setup>
// M1 只搭骨架：条目清单是世界书接入前的占位分类
const 待收录 = [
  '七层结构',
  '十二支族',
  '势力与机关',
  '原生灵科技',
  '旧网与深网',
  '遗迹与造物',
  '历法与编年',
];
</script>
