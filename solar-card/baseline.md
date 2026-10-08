# T0.1 · 基线冻结记录

> 冻结时间：2026-10-04 ｜ 冻结人：Codex ｜ 用途：索拉利亚角色卡工程的可复现起点

## 1. 代码基线

| 项 | 值 |
|---|---|
| 仓库 | `wuminggla/pellucid-grove`（九条会前端工程，模板体系来自 StageDog/tavern_helper_template） |
| 提交 | **`5455ec0`**（用户指定） |
| 获取方式 | `https://codeload.github.com/wuminggla/pellucid-grove/tar.gz/5455ec0` |
| 压缩包 SHA256 | `868EC3AC63E74E7BA79E7BF909456245DCDFC755090ED3F342D43BAECE027D2F` |
| 压缩包大小 | 5,372,440 B |
| 解包后 | 322 个文件 / 10.1 MB / 92 个目录 |

### 校验点（与线上产物比对一致）

| 文件 | 5455ec0 实测 | 说明 |
|---|---|---|
| `dist/jiutiao/界面/状态栏/index.html` | **647,519 B** | 与 jsDelivr 上 `@5455ec0` 的产物一致 → 确认取到的是同一提交 |
| `src/jiutiao/界面/状态栏/index.ts` | 11,882 B | 全屏挂载入口 |
| `src/jiutiao/脚本/PellucidLoader/index.ts` | 6,165 B | 加载器 |
| `src/jiutiao/schema.ts` | 11,059 B | v1 遗留变量结构 |

### ⚠ 与本地素材包的差异（重要）

本地 `D:\AI\VSCode\Code\Codex\素材\jsk\pellucid-grove-master` 是 **master 快照**，与 `5455ec0` 不同：

| 文件 | master（本地素材） | 5455ec0（本工程基线） |
|---|---|---|
| `dist/.../index.html` | 655,500 B | **647,519 B** |
| `src/.../状态栏/App.vue` | 46,599 B | **45,920 B** |
| `src/.../状态栏/runner-store.ts` | 72,586 B | **65,865 B** |

**本工程一切以 `5455ec0` 为准。** 后续若要跟作者上游更新，必须显式做一次迁移决策，不能直接覆盖。

## 2. 世界观基线

| 项 | 值 |
|---|---|
| 文件 | `C:\Users\lcy\Documents\Codex\2026-08-14\b-w\outputs\Solar_worldbook_split.json` |
| 体量 | 1,150,240 B / 336 条 / 正文 195,901 字 |
| 结构 | `{entries: {uid: ...}}`；8 条常驻、333 条蓝灯（带触发词）、0 条禁用 |
| 现状 | **不含人物（0 条 `[角色]`）、不含玩法** —— 角色与玩法均为本卡新增工作量 |
| 接入状态 | **暂缓**（D5）：本工程只留 provider 接口与 12 支族小表 |

## 3. 运行环境（待实测锁定）

| 项 | 状态 |
|---|---|
| SillyTavern 版本 | 待在你的实际环境记录（M1 实机验收时补） |
| 酒馆助手（TavernHelper / JS-Slash-Runner）版本 | 待记录 |
| 是否需要 MVU | **不需要**（D6：chat 变量 + 前端自建校验） |
| 节点环境 | node v25.x / pnpm 11.25（构建用，仅开发依赖） |

## 4. 复核方式

```powershell
# 重新核对基线哈希
Get-FileHash .\work\solar-card\pellucid-grove-5455ec0.tar.gz -Algorithm SHA256
# 期望 868EC3AC63E74E7BA79E7BF909456245DCDFC755090ED3F342D43BAECE027D2F
```
