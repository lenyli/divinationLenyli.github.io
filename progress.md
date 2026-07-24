# zhanbu 进度记录

> 仓库级记录。**具体改动请记到子项目自己的 progress**：[Divination](Divination/progress.md) · [Drawing](Drawing/progress.md)。
> 同步副本见 Obsidian：`obsidian/Projects/zhanbu`。

## 2026-07-24 · [cc] 配置项目级子 agent（父准则规则 8）

- 写入 `.claude/agents/`（随本项目 git，不进父同步仓）：frontend-developer(sonnet)。主对话模型 Opus 4.8。
- 分配原则：写码用 Sonnet／深度设计·推理用 Opus／轻量铺量用 Haiku，均可派发时按需临时覆盖。
- 来源 agency-agents 库，已转 Claude 格式（name→kebab 小写、删 color/emoji/vibe、钉 `model:`，正文原样保留作系统提示）。

## 2026-07-23 · Divination 灵签乱码修复完成

- **改了什么**：重写遗失的转换脚本 `Divination/gen_data.py`；修掉 `Divination.cs` 剩余 6 处 `U+E5F1`（第 4 处按用户指正为「命蹇时乖处是非」）；回流 PWA / iOS / macOS 三端；PWA 缓存版本升 v3。详见 [Divination/progress.md](Divination/progress.md)。
- **为什么改**：转换脚本遗失导致「单一数据源」失效，源改了三端跟不上，乱码在派生数据里长期没被发现。
- **如何验证**：脚本先用未修改的 cs 做回归，生成结果与原三端文件逐字节一致（仅差已知两处内容），确认复现原转换器行为；修复后四份文件乱码计数均为 0，`--check` 三端通过；`node` eval `data.js` 12 个常量条目数正确。
- **未做**：全部改动尚未提交 git；各端未重新出包。

## 2026-07-23 · 拆分为两个子项目文档

- **改了什么**：新建仓库顶层 `README.md`（此前缺失，是既有待办）；为 Divination、Drawing 各建 `README.md` 与 `progress.md`；原 `Drawing/README.md` 里的站点级内容上移到顶层，该文件改为只讲 Drawing。
- **为什么改**：`zhanbu` 下实为两个相互独立的小项目，共用一份混合 README 既不好找也容易写错（旧 README 的「二百签」说法就是错的）。
- **两处实质发现**（详见各子项目记录）：
  1. **Drawing 签数与文档不符**——实际 99 签、每签 8 句五言 + 译文；且第 397、398 条偈句未入库，第 100 签疑似缺失。
  2. **Divination 签文有未修完的乱码**——玄天灵签里私用区字符 `U+E5F1` 共 7 处上下文，**全都应该是「处」**；07-21 只在 `Divination.cs` 修了其中 1 处，源文件仍残留 6 处，三个派生端各仍有 7 处且修正未回流；转换脚本已不在仓库中。
- **如何验证**：Python 解析 `Drawing-PWA/data.js` 得 99 条、`lines` 均为 8；`grep -cE "^\s*[0-9]+\." 摇签.txt` = 398；`git diff` 确认 `Divination.cs` 改动为 4 处；扫描 `U+E000–U+F8FF` 并打印上下文，得 cs=6、PWA/iOS/macOS 各 7。

## 2026-07-23 · 补建本地进度记录（回填）

- **改了什么**：本项目此前只有 Obsidian 侧记录、本地缺 `progress.md`，本次按 git 历史与目录结构回填一条基线记录。
- **为什么改**：项目准则要求每个项目在本地维护 `progress.md`，与 Obsidian 双向对齐。
- **如何验证**：`git log` 最后一次提交为 2026-07-18「move」（目录整理）；此后 `Divination/Divination.cs` 于 2026-07-21 有文件改动但**未提交**，改动内容无记录；工作区无新增文件。

## 基线状态（截至 2026-07-21，状态：已完成）

**已完成**

- `Drawing/Drawing-PWA`：二百签等概率随机、摇筒动画、竖排签文、震动反馈；自带 `README-PWA.txt`
- `Divination/Divination-PWA`：多体系综合占卜
- 两个静态站点 GitHub Pages 发布路径已通
- 2026-07-18 目录整理（`move`）

**历史 / 实验产物（是否保留待定）**

- `Divination.exe` / `Divination.bat` / `build.bat` / `Divination.cs`
- `DivinationOS.ipa`、`Divination-iOS`、`Divination-macOS`
- `抽牌.xlsm`、`塔罗普通牌含义.xlsx`、`特殊牌.txt`

**未完成**

- 统一仓库顶层 README（目前说明主要在 Drawing 侧）
- 清理/归档上述历史 exe、ipa、Excel 原型
- iOS / macOS 包装是否继续维护
- **`Divination.cs` 的 07-21 未提交改动需确认后提交或还原**

> 2026-07-21 及之前的详细过程无本地记录，以上为回填基线。
