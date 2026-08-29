# Divination — 综合占卜工具

十四个占卜模块的多端应用。现有七个模块仍以 **`Divination.cs`（Windows WinForms，单文件 C#）作为静态数据与算法基准**，PWA / iOS / macOS 三端的数据表由它转换生成；新增七种传统术数共用 [`TraditionalAlgorithms/adapter.ts`](TraditionalAlgorithms/adapter.ts) 与离线构建产物，避免四端分别维护口诀表。

正式 PWA 地址：<https://lenyli.github.io/divinationLenyli.github.io/Divination/Divination-PWA/>
（站点级说明与另一个应用见仓库根目录 [`../README.md`](../README.md)）

## 模块

| 模块 | 数据表（PWA `data.js`） | 说明 |
| --- | --- | --- |
| 首页 | `DATE12` | 综合占卜 / 日期预测（12 条） |
| 六爻 | `TRI_ELEM`、`HEXAGRAMS`、`POS` | 64 卦，算法复刻自 `抽牌.xlsm`，已用固定掷币序列对照 Excel 验证一致 |
| 塔罗 | `TAROT`、`YESNO` | 通用 / YES OR NO / 大牌，含特殊牌开关 |
| 雷诺曼 | `LENORMAND` | 43 张，抽 3 张不重复 |
| 卢恩符文 | `RUNES` | 抽 3 枚不重复 |
| 占星骰子 | `PLANETS`、`SIGNS`、`HOUSES` | 行星 + 星座 + 宫位 |
| 玄天上帝感应灵签 | `QIAN` | 49 签，每签 12 个字段 |
| 奇门遁甲 | `traditional-algorithms.js` | 时家、转盘、拆补法；输出九宫盘和值符值使 |
| 大六壬 | `traditional-algorithms.js` | 月将加时、四课三传与取传规则 |
| 小六壬 | `traditional-algorithms.js` | 农历月日时三步排宫 |
| 梅花易数 | `traditional-algorithms.js` | 时间 / 数字起卦，输出主互变与体用 |
| 太乙神数 | `traditional-algorithms.js` | 年/月/日/时四计七十二局基础盘 |
| 金口诀 | `traditional-algorithms.js` | 时间 / 指定地分 / 数字起课 |
| 择日/黄历 | `traditional-algorithms.js` | 按事项与日期范围给出透明候选依据 |

各端共有：子标签、页面状态缓存、每模块 30 条历史记录、结果一键复制（格式为「问题：占卜结果」，便于粘给 AI 解读）。

## 各端

| 端 | 位置 | 构建 / 运行 | 数据表 |
| --- | --- | --- | --- |
| **Windows** | `Divination.cs` + `Divination.bat` / `build.bat` | 现有模块保持单文件 WinForms；新增七种入口打开同目录离线 PWA，分发时须保留 `Divination-PWA/` | 源文件内嵌 + 共用离线算法包 |
| **PWA** | `Divination-PWA/` | 正式地址见上方；本地可用 `python3 -m http.server`，需 https/localhost 才能安装与离线 | `data.js` + 共用离线算法包 |
| **iOS** | `Divination-iOS/` | Xcode 14+ / iOS 16+；SwiftUI 通过系统 JavaScriptCore 读取共用离线算法资源 | `DivinationData.swift` + 共用离线算法包 |
| **macOS** | `Divination-macOS/` | Xcode 14+ / macOS 13+；SwiftUI 通过系统 JavaScriptCore 读取共用离线算法资源 | `DivinationData.swift` + 共用离线算法包 |

三端数据表**不要手改**，一律由 [`gen_data.py`](gen_data.py) 从 `Divination.cs` 生成，见下方「数据同步」。

历史记录：Windows/macOS 存 `~/Library/Application Support/Divination/history.dat`（同格式），iOS 存 App 沙盒同名路径，PWA 存 `localStorage`。

各端另有更细的说明：`Divination-PWA/README-PWA.txt`、`Divination-iOS/README-iOS.txt`、`Divination-macOS/README-macOS.txt`。

新增传统术数的采用口径、来源、限制、构建边界和第三方许可见 [`ALGORITHM_SOURCES.md`](ALGORITHM_SOURCES.md) 与 [`TraditionalAlgorithms/`](TraditionalAlgorithms/)。固定结果摘要在 `TraditionalAlgorithms/golden.json`，可运行 `node TraditionalAlgorithms/verify.js` 校验。

## 数据同步

**改完 `Divination.cs` 后必须跑一次转换脚本**，否则三端数据会和源脱节：

```bash
python3 gen_data.py            # 生成三端数据表
python3 gen_data.py --check    # 只校验现有文件是否与 cs 一致（可用作提交前检查）
```

`gen_data.py` 从 cs 解析 12 张表（`TRI_ELEM` / `HEXAGRAMS` / `POS` / `PLANETS` / `SIGNS` / `HOUSES` / `LENORMAND` / `RUNES` / `QIAN` / `TAROT` / `YESNO` / `DATE12`），写出 `Divination-PWA/data.js` 与 iOS、macOS 两份 `DivinationData.swift`（后两者内容相同）。脚本同时会报告 cs 里残留的私用区乱码字符。

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
