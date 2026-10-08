# T0.3 · 复用边界表（pellucid-grove@5455ec0 → 索拉利亚）

标注含义：**原样** = 不改或仅改名｜**参数化** = 改配置/常量｜**重写** = 换内容层｜**删除** = 不进入新卡｜**暂缓** = 留接口等素材

## 1. 直接复用（M1 已用上）

| 路径 | 处理 | 说明 |
|---|---|---|
| `webpack.config.ts` | 参数化 | 把 entry 扫描从 `{示例,src}/**` 改成 `src/**`；其余（单文件 HTML 内联、Vue 外部化为全局、pinia 走 CDN ESM、obfuscate 开关）原样 |
| `tsconfig.json` / `@types/` / `global.d.ts` | 原样 | 酒馆助手与酒馆的类型声明 |
| `util/*` | 原样 | 模板工具（iframe srcdoc、mvu、streaming） |
| `初始模板/*` / `示例/*` | 原样保留 | 模板自带示例，不再参与构建（已被 webpack entry 排除） |
| `src/jiutiao/界面/状态栏/index.ts` 的**挂载思路** | 重写（保留结构） | 全屏宿主 / 样式克隆 / 几何自检 / 内联回退 / pagehide 清理，全部保留；改名与文案换成索拉利亚 |
| `src/jiutiao/界面/状态栏/vue-flags.ts` | 原样 | pinia 走 CDN 时的编译期 flag 兜底（少这个会黑屏） |
| `src/jiutiao/脚本/PellucidLoader/index.ts` | 重写为 `SolariaLoader` | 保留"主源 + 镜像 + 版本锁定"结构 |

## 2. 参数化 / 换内容

| 路径 | 处理 | 说明 |
|---|---|---|
| `界面/状态栏/global.css` | **重写** | 黑金木纹 → 终末地终端风（实测色板见下） |
| `界面/状态栏/version.ts` | 重写 | 版本与阶段标记 |
| `界面/状态栏/tavern-ai.ts` | 重写为 `ai.ts` | 保留"预设前缀 + `generateRaw` + `same_as_preset` + 副 API"四件事，去掉九条会的玩法耦合 |
| `界面/状态栏/extract.ts` | 暂缓 | XML 标签解析在 M2 做输出协议时再接 |
| `界面/状态栏/memory-settings.ts` / `pov-settings.ts` / `prompt-inject.ts` | 暂缓 | 与 `game/**` 强耦合，M2 重建 |

## 3. 删除（不进新卡）

| 路径 | 原因 |
|---|---|
| `src/jiutiao/game/**`（16 模块 / 723 KB / 65 文件） | 九条会玩法（日程循环/经济/地盘/升级/声望/堕落）在沙盒跑团里不成立 |
| 其中 `game/worldbook/demo.ts`（268 KB） | 九条会内置世界书 |
| `src/jiutiao/sillytavern/**`（12 文件 / 51 KB） | 线上零引用的 Dexie 兼容层 |
| `assets/portraits/**` | 九条会立绘（索拉利亚美术走 ComfyUI，见 D13） |
| `docs/**` / `scripts/**` | 九条会文档与专用脚本 |
| `dist/jiutiao/**` | 旧构建产物 |
| `界面/状态栏/components/**`（16 个组件） |  RinPanel / TurfPanel / AvPanel / UpgradePanel / SlotStrip… 全是九条会语义 |
| `界面/状态栏/runner-store.ts`（65 KB） | 九条会状态机与存档结构 |
| `界面/状态栏/App.vue`（46 KB） | 九条会 UI 外壳 |

## 4. 新增（M1 已写）

| 路径 | 作用 |
|---|---|
| `src/solaria/界面/状态栏/state.ts` | **状态唯一事实来源**：7 属性 × 21 技能 + 资源 + 尺度 + 世界；含默认值与"钳制/补缺"（脏数据不崩） |
| `src/solaria/界面/状态栏/store.ts` | chat 变量存读档（`getVariables`/`insertOrAssignVariables`, `type:'chat'`） |
| `src/solaria/界面/状态栏/ai.ts` | 生成链路（预设前缀 + `generateRaw` + `same_as_preset`）+ 副 API 配置位 |
| `src/solaria/界面/状态栏/App.vue` | 终端风外壳（顶栏 / 左导航 / 主区 / 底栏） |
| `src/solaria/界面/状态栏/views/TerminalView.vue` | 生成测试 + 存读档 + 日志（M1 的验收面板） |
| `src/solaria/界面/状态栏/views/OperativeView.vue` | 7 属性 + 21 技能的查看与手改（干员页） |
| `src/solaria/界面/状态栏/views/SettingsView.vue` | 双尺度开关 + 副 API + 构建信息 + 状态预览 |
| `src/solaria/界面/状态栏/views/SettingsView.vue` 的「存档 / SAVE」区块 | **存档界面并入设置**（D22）：保存 / 读取 / 新建档 / 复制 JSON / 存档状态行 |
| `src/solaria/界面/状态栏/components/Icon.vue` + `icons.ts` | 单色 SVG 图标组件与 path 数据；目前三枚（用户提供）：存档/设置、个人档案（ID 卡）、资料。全部 `currentColor` 填充 |
| `icons.ts` 的 `ICONS` 规格表 | **左栏图标唯一尺寸来源**（D26）：每枚 = `{d, box(紧 viewBox), w, h, note}`，统一高度 16、宽度按宽高比；换图标只改这一处 |
| `src/solaria/界面/状态栏/views/ArchiveView.vue` | **个人档案页**（替代原「干员」，D23）：身份 + 7 属性 + 21 技能的查看与手改 |
| `src/solaria/界面/状态栏/views/DataView.vue` | **资料页**（原"世界观档案"，D23）：解锁制收集页的空态骨架，M3 随世界书接入填充 |
| `src/solaria/界面/状态栏/views/LogView.vue` | **日志页**（D24）：目标 / 事件线 / 人物 / 大事记四分组骨架；由引擎每回合写回时追加 |
| `src/solaria/界面/状态栏/views/GoalsView.vue` | **目标页**（D27）：自设目标 + 接到的委托；与日志构成"将来 / 过去" |
| `src/solaria/界面/状态栏/views/MapView.vue` | **地图页**（D23）：分层 / 当前位置 / 已知地点 / 探索度 四分组骨架；M2 后期随 T4.4 复用"百分比坐标 + 多边形分区 + 图钉"接入 |
| `design/map-icon.svg` / `design/compass.svg` / `design/icons-preview.html` | 图标设计稿：已采用的折叠地图、备选指南针、五枚并排对照 + 左栏效果模拟 |
| `global.css` 的 `--rail-w` / `--rail-w-open` | 左栏收起/展开尺寸（D28）：52px ↔ 168px，纯 CSS `:hover` / `:focus-within`，展开时覆盖内容不推挤排版 |
| `global.css` 的左栏尺寸族（`--rail-slot/-icon-h/-mark/-gap/--rail-btn-*`） | 左栏尺寸唯一来源（D30）：图标 2×、间距 1.5×；手机端可单独覆盖退回 1× |
| `global.css` 的 `--nav-off/-hover/-on` | 导航三态色（D31）：D9D9D9 / 858585 / 191919；选中项左侧 4px 黑条紧贴页面边缘 |
| `global.css` 的滚动布局（D32） | 根容器 `height:100dvh + overflow:hidden`，`.so-main { overflow:auto; min-height:0 }` —— 只让主区滚，左栏与底栏固定 |
| `components/Icon.vue` | 尺寸**不再由 JS 传入**（D30）：`width/height:100%` + `preserveAspectRatio="xMidYMid meet"`，实际尺寸由 `.icn` 槽的 CSS 变量决定 |
| `src/solaria/界面/状态栏/brand.ts` | **星宿联邦徽记**（D29）：由 `work/solar-card/make-brand-mark.mjs` 从用户提供的 `Federation.png` 生成（裁剪 + 缩放到 64×64 + 灰度置满保留 alpha），当 CSS mask 用，颜色随主题 |

## 5. 双主题色板（v2：按三张实拍参考修正）

修正结论：**官网内容页是浅色**（白底 / 黑字 / 灰选中块 + 左侧亮黄装饰带），黄黑整体只属于加载页。
对应到本卡：**创建向导 = 黄黑（加载语义）**，**主界面 = 浅色黑白灰 + 黄装饰带**。

### ① 主界面（已落在 `global.css`）

| 用途 | 色值 |
|---|---|
| 页面底 | `#FFFFFF` |
| 次级块（选中行 / 输入底） | `#F6F6F6` |
| 细线 / 强线 | `#E2E2E2` / `#C9C9C9` |
| 主文字（黑） | `#111111` |
| 次级 / 弱 / 更弱 | `#4A4A4A` / `#8A8A8A` / `#B5B5B5` |
| **主按钮 / 锚点块** | **黑底 `#111111` + 白字**（对应"更多情报""前往游戏"） |
| 左栏与内容的分界 | **"影子淡出"**：左栏 `box-shadow: 8px 0 18px -10px rgba(0,0,0,.22)` + 主区左缘 28px 渐隐层（`rgba(0,0,0,.06) → 透明`）；不再画硬边或黄带 |
| 标记黄 | `#FFFA00`（极小面积：当前日期等位置指示） |
| 底部状态栏 | 黑底 `#111111` + 浅灰字（承载原顶栏信息） |
| 左栏选中态 | **浅灰块 `#E9E9E9` + 黑字**（参考页"公告"选中态） |
| 语义色 | 红 `#D93025`／橙 `#C77700`／绿 `#1E8E3E`（浅底上压暗过） |

### ② 创建向导（token 已留位，M2 实现）

| 用途 | 色值 |
|---|---|
| 底 | `--so-crt-bg: #131313` |
| 强调 | `--so-crt-accent: #FFFA00` |
| 文字 | `--so-crt-text: #FFFFFF` |

木纹变量（`--wood-*`）不再使用；黄带 token（`--so-band`）已删除（主界面不留大面积黄）。

## 6. 布局口径（D21）

- **没有顶栏**：品牌挂在左栏栏首；身份/时间/地点/资源/环境灯全部进**底部状态栏**（黑条白字）。
- **页头层级**：`// TERMINAL`（小灰等宽）+ 大号中文标题（终端的 24px 黑体）。
- **左栏**：白底黑字，选中 = 浅灰实心块，手机端落成底部横向条。
