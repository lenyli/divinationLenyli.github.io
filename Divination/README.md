# Divination — 综合占卜工具

十五个占卜模块的多端应用。卡牌与签文模块仍以 **`Divination.cs`（Windows WinForms，单文件 C#）作为静态数据与算法基准**，PWA / iOS / macOS 三端的数据表由它转换生成；七种传统术数共用 [`TraditionalAlgorithms/adapter.ts`](TraditionalAlgorithms/adapter.ts) 与离线构建产物。Windows 构建会把兼容算法资源直接嵌入 EXE，运行时不依赖 PWA 文件夹。

## 规则适用范围

本目录是 Zhanbu 项目的嵌套产品说明，执行任务时先遵守 `/Volumes/Leny/Projects/CLAUDE.md` 与上级 [`README.md`](../README.md)。修改 `Divination.cs` 时，同步生成受影响的三端数据表属于该源码改动的一部分；`--check`、传统术数构建、应用运行、测试和出包仍须由用户按总规则明确开启相应阶段。本文件不另行授权 Git、截图或状态文档写入。

正式 PWA 地址：<https://lenyli.github.io/divinationLenyli.github.io/Divination/Divination-PWA/>
（站点级说明与另一个应用见仓库根目录 [`../README.md`](../README.md)）

## 模块

| 模块 | 数据表（PWA `data.js`） | 说明 |
| --- | --- | --- |
| 首页 | `DATE12` + `traditional-algorithms.js` | 综合占卜冻结一次时间与六组三钱，拼接六爻及六种传统术数的 `aiPromptSection` |
| 六爻纳甲 | `TRI_ELEM`、`HEXAGRAMS`、`POS` + 共享适配层源码 | 四端单项与综合运行入口统一调用共享算法；输出完整主变互错综、纳甲、世应、六亲六神、旺衰冲破暗动、伏神与动变事实 |
| 塔罗 | `TAROT`、`YESNO` | 通用 / YES OR NO / 大牌；先等概率抽实体，再对可逆牌抽正逆位，同一轮按实体去重 |
| 雷诺曼 | `LENORMAND` | 43 张现有牌 + 6 张国色华光差异扩展牌；扩展牌由现有“包含特殊牌”开关启用 |
| 卢恩符文 | `RUNES` | 先等概率抽 3 个符文实体，再只对有逆位资料的实体抽正逆位；Wyrd 不强造逆位 |
| 占星骰子 | `PLANETS`、`SIGNS`、`HOUSES` | 行星 + 星座 + 宫位 |
| 玄天灵签 | `QIAN` | 49 签，每签 12 个字段；第 42/43 签的解曰已按 `source-data/xuantian-slip-42-43.json` 补全并回流中英文资源 |
| 奇门遁甲 | `traditional-algorithms.js` | 时家、转盘、拆补法；输出九宫盘和值符值使 |
| 大六壬 | `traditional-algorithms.js` | 月将加时、四课三传与取传规则 |
| 小六壬 | `traditional-algorithms.js` | 农历月日时三步排宫 |
| 梅花易数 | `traditional-algorithms.js` | 时间 / 数字起卦，输出主互变与体用 |
| 太乙神数 | `traditional-algorithms.js` | 年/月/日/时四计七十二局基础盘 |
| 金口诀 | `traditional-algorithms.js` | 时间 / 指定地分 / 数字起课 |
| 择日/黄历 | `DATE12` + `traditional-algorithms.js` | 合并原日期预测：塔罗/占星时长、奇门/六壬/梅花应期及按事项与日期范围生成的黄历候选 |
| 复古神谕 | `ORACLE` | 全部 52 张：49 张核心牌默认启用，3 张植物强调牌由现有“包含特殊牌”开关启用；独立抽牌含正逆位完整说明 |

各端共有：子标签、页面状态缓存、每模块 30 条历史记录和结果一键复制。塔罗、雷诺曼、卢恩、占星骰子与复古神谕保留既有外层格式；综合、六爻、玄天灵签和七种传统术数复制专用 `aiPrompt`，界面仍显示盘面 `display`。PWA 新记录同时保存结构化记录对象，并兼容读取旧版纯文本历史；Apple/Windows 的卡牌历史仍是旧文本格式，后续需迁移。

除择日／黄历外，四端所有占卜方式都在问题输入框上方提供“所测何事”和“性别”；两项默认均为不选，婚恋／婚姻类必须选择性别，其他类别允许性别留空，寻人寻物类另提供寻找对象。共享适配层只输出有结构来源的事项定位：六爻保留候选并只在唯一明现／唯一伏藏时自动取用；大六壬保留类神候选和天地盘原始对应；小六壬不再用口诀关键词推断事项；太乙只标辅助主客角色而不按数值判胜负；金口诀不把同六亲候选冒充唯一用神；梅花继续采用简化体用口径。

PWA 在手机宽度下采用与 iOS 相同的四列四行导航：首页／择日黄历／复古神谕／中英切换位于第一行，其余模块位置保持不变；手机六爻的动爻选择独占第二行。桌面宽度仍使用两排导航，复古神谕位于占星骰子之后，择日／黄历位置不变。

首页只保留“综合占卜”，会加入复古神谕三张牌，并把奇门、大六壬、小六壬、梅花、太乙和金口诀压缩为同一版合参结果。综合 AI 提示中的复古神谕只给牌名、正逆位、领域与流向，不展开细致牌义。原“日期预测”已合并进“择日／黄历”：采用塔罗、占星骰子及有应期依据的奇门、大六壬、梅花，再按事项和日期范围附上完整黄历候选；太乙、金口诀、小六壬不强行换算为具体日期。单项结果只显示盘面和结论，不显示算法版本、来源、限制等开发信息。

“包含特殊牌”首次开启需要验证码；成功后只保存本机布尔解锁标记，不保存验证码或输入内容，关闭后再次开启不重复验证。PWA 使用 `localStorage`，iOS/macOS 使用 `UserDefaults`，Windows 使用 `%LOCALAPPDATA%\Divination\settings.json`；开关本身不会跨重启保持开启。

综合占卜按卡牌与卦象、传统术数分段使用专用 Prompt；事项分类会传给六爻纳甲、奇门、大六壬、小六壬、梅花、太乙和金口诀。择日／黄历只显示和复制排序后的前 5 条候选，内部 `allDays` 仍保留完整范围；灵签正文只在界面与灵签单项 Prompt 中出现，不进入综合 AI Prompt。

## 各端

| 端 | 位置 | 构建 / 运行 | 数据表 |
| --- | --- | --- | --- |
| **Windows** | `Divination.cs` + `Divination.bat` / `build.bat`（`Divination.ico` 可选） | WinForms 原生界面；算法已压缩内嵌在 CS 中，BAT 只编译 CS，生成后的 `Divination.exe` 可单文件运行，不需要外部 JS 或 `Divination-PWA/` | 源文件内嵌 + CS 内嵌兼容算法 |
| **PWA** | `Divination-PWA/` | 正式地址见上方；本地可用 `python3 -m http.server`，需 https/localhost 才能安装与离线 | `data.js` + 共用离线算法包 |
| **iOS** | `Divination-iOS/` | Xcode 14+ / iOS 16+；SwiftUI 通过系统 JavaScriptCore 读取共用离线算法资源 | `DivinationData.swift` + 共用离线算法包 |
| **macOS** | `Divination-macOS/` | Xcode 14+ / macOS 13+；SwiftUI 通过系统 JavaScriptCore 读取共用离线算法资源 | `DivinationData.swift` + 共用离线算法包 |

三端数据表**不要手改**，一律由 [`gen_data.py`](gen_data.py) 从 `Divination.cs` 生成，见下方「数据同步」。

历史记录：Windows/macOS 存 `~/Library/Application Support/Divination/history.dat`（同格式），iOS 存 App 沙盒同名路径，PWA 存当前浏览器的 `localStorage`。这些记录均为本机数据，不会自动跨设备或跨浏览器同步；清除站点/App 数据会同时清除对应本机记录与特殊牌解锁标记。

各端另有更细的说明：`Divination-PWA/README-PWA.txt`、`Divination-iOS/README-iOS.txt`、`Divination-macOS/README-macOS.txt`。

新增传统术数的采用口径、来源、限制、构建边界和第三方许可见 [`ALGORITHM_SOURCES.md`](ALGORITHM_SOURCES.md) 与 [`TraditionalAlgorithms/`](TraditionalAlgorithms/)。固定结果摘要在 `TraditionalAlgorithms/golden.json`，可运行 `node TraditionalAlgorithms/verify.js` 校验。

## 数据同步

**改完 `Divination.cs` 后必须跑一次转换脚本**，否则三端数据会和源脱节：

```bash
python3 gen_data.py            # 生成三端数据表
python3 gen_data.py --check    # 只校验现有文件是否与 cs 一致（可用作提交前检查）
```

`gen_data.py` 从 cs 解析 13 张表（`TRI_ELEM` / `HEXAGRAMS` / `POS` / `PLANETS` / `SIGNS` / `HOUSES` / `LENORMAND` / `ORACLE` / `RUNES` / `QIAN` / `TAROT` / `YESNO` / `DATE12`），写出 `Divination-PWA/data.js` 与 iOS、macOS 两份 `DivinationData.swift`（后两者内容相同）。脚本同时会报告 cs 里残留的私用区乱码字符。

传统术数适配层变化后，另在 `TraditionalAlgorithms/` 运行 `pnpm run build:windows`，更新供 BAT 嵌入 EXE 的 IE11 兼容资源。该资源仅是构建输入，生成后的 EXE 不需要旁路脚本文件。

## 2026-09-02 指南修复状态

本轮继续按用户提供的整改规范完成全端修复：四端六爻入口统一到共享算法，并在世爻、应爻后追加动爻；统一 `aiPromptVersion` / `aiPromptSection` / `aiPrompt` 合同；综合页冻结同一时间与投掷；择日仅展示前 5 条；42/43 签补全；四端增加特殊牌一次性验证码；复古神谕提示改为单项界面独立一行且不进入复制或综合结果；PWA 金口诀恢复七格常显，缓存更新为 `divination-v27-jinkou-oracle-liuyao-ui`。

当前仍有三项明确开放项：

- `adapter.ts`、PWA/Apple 共用 `traditional-algorithms.js` 与 Windows 内嵌载荷均已提升为 `mingyu-core-0.1.32+zhanbu-5`；23 个 PWA/Windows 差分样例和 5 个非法输入合同检查通过。
- 第 42/43 签已使用本任务补全源关闭截断问题；DATE12 水瓶三段日期重叠仍保持未决，不擅改。
- Apple/Windows 卡牌历史尚未迁移为与 PWA 相同的结构化 schema。

> 该脚本是 2026-07-23 重写的——原转换脚本已遗失，导致源改了、三端没跟上。重写后用**未修改的 cs** 做过回归：生成结果与当时的三端文件逐字节一致（仅差当时已知的两处内容），确认与原转换器行为相同。

## 已修复：灵签乱码（2026-07-23）

玄天灵签数据里曾有一个私用区乱码字符 `U+E5F1`，共 7 处，**全部应为「处」**。现已在 cs 中改正并回流三端：

| # | 原文 | 改为 |
| --- | --- | --- |
| 1 | 夜静月明风细`␥` | 夜静月明风细**处** |
| 2 | 清光烁`␥`群星散 | 清光烁**处**群星散 |
| 3 | 失时无`␥`把身安 | 失时无**处**把身安 |
| 4 | 命**赛**时乖是`␥`非 | 命**蹇**时乖**处是**非 |
| 5 | 月当明`␥`被云遮 | 月当明**处**被云遮 |
| 6 | 不愁无`␥`获金珠 | 不愁无**处**获金珠 |
| 7 | 要知踪迹归何`␥` | 要知踪迹归何**处** |

第 4 处除补「处」外还改了两点：`赛`→`蹇`（命蹇时乖），且「处」在「是」之前。第十六签「占身宜守旧，**．**失物不见」的多余全角点也已随之清除。

现状：四份文件乱码计数均为 **0**，`gen_data.py --check` 三端全部通过。

## 参考资料（保留）

`抽牌.xlsm`（算法原始出处）、`塔罗普通牌含义.xlsx`、`特殊牌.txt`（牌义已写入 `Divination.cs`，原文留作对照）。
