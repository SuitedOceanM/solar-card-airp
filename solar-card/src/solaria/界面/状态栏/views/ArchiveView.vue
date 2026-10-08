<template>
  <section class="so-panel">
    <div class="ph">个人档案 / PROFILE</div>
    <div class="pb">
      <div class="so-grid c2">
        <div class="so-field"><label>姓名 / 代号</label><input v-model="st.人物.姓名" /></div>
        <div class="so-field"><label>支族</label>
          <select v-model="st.人物.支族">
            <option v-for="s in 支族表" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
        <div class="so-field"><label>年龄</label><input v-model.number="st.人物.年龄" type="number" min="1" /></div>
        <div class="so-field"><label>一句话简介</label><input v-model="st.人物.简介" placeholder="可留空" /></div>
      </div>
      <p style="margin-top:8px;font-size:11.5px;color:var(--so-faint);line-height:1.6">
        支族特性表在 M1 只搭框架：合成种固定 20 智力（见 systems-design §9.5）。其余支族待填。
      </p>
    </div>
  </section>

  <section class="so-panel">
    <div class="ph">属性 / ATTRIBUTES（上限 20 · 芯片与遗物可达 25）</div>
    <div class="pb">
      <div class="so-grid c2">
        <div v-for="a in 属性表" :key="a" class="so-attr">
          <span class="n">{{ a }}<small>{{ 拉丁[a] }}</small></span>
          <span style="display:flex;align-items:center;gap:8px">
            <button class="so-btn" style="padding:1px 8px" @click="step(a, -1)">−</button>
            <span class="v">{{ st.属性[a] }}</span>
            <button class="so-btn" style="padding:1px 8px" @click="step(a, 1)">＋</button>
          </span>
        </div>
      </div>
    </div>
  </section>

  <section class="so-panel">
    <div class="ph">技能 / SKILLS（21 项 · 各 0–5）</div>
    <div class="pb">
      <div v-for="a in 属性表" :key="a" style="margin-bottom:10px">
        <div style="font-size:11px;letter-spacing:2px;color:var(--so-dim);margin-bottom:5px">{{ a }}</div>
        <div class="so-skills">
          <div v-for="s in 技能表[a]" :key="s" class="sk">
            <span class="n">{{ s }}</span>
            <span style="display:flex;align-items:center;gap:6px">
              <button class="so-btn" style="padding:0 6px" @click="stepSkill(a, s, -1)">−</button>
              <span class="lv" :class="{ zero: !st.技能[键(a, s)] }">{{ st.技能[键(a, s)] }}</span>
              <button class="so-btn" style="padding:0 6px" @click="stepSkill(a, s, 1)">＋</button>
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { 属性表, 属性上限常规, 属性上限突破, 技能表, 技能上限, 技能键 } from '../state';
import { state as st, pushLog } from '../store';

// 说明：M1 只做"能改能存"，点数经济（技能点 3–5 战 1 点 / 经验点）在 M2 接入
const 拉丁 = { 体魄: 'PHY', 专注: 'FOC', 智力: 'INT', 技术: 'TEC', 口才: 'SOC', 战斗: 'CMB', 源质: 'ESS' };
const 支族表 = ['人类种', '真龙种', '仙狐种', '鬼狐种', '魔化种', '仙灵种', '灵兽种', '合成种', '水生种', '矮人种', '共生种', '大型亚人种', '小型亚人种', '天翼种'];

const 键 = 技能键;

function step(a, d) {
  const next = st.属性[a] + d;
  if (next < 0 || next > 属性上限突破) return;
  st.属性[a] = next;
  if (next > 属性上限常规) pushLog(`${a} 已进入突破档（${next}）：应当只有芯片/古代遗物能给到这个值`);
}

function stepSkill(a, s, d) {
  const k = 技能键(a, s);
  const next = (st.技能[k] ?? 0) + d;
  if (next < 0 || next > 技能上限) return;
  st.技能[k] = next;
}
</script>
