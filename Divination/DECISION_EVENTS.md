# Zhanbu Decision Events

## 2026-08-29 — 新增七种传统术数共用离线算法包

- decision：奇门遁甲、大六壬、小六壬、梅花易数、太乙神数、金口诀、择日/黄历共用一个版本化结果适配层和静态算法包；PWA 直接加载，iOS/macOS 通过系统 JavaScriptCore 读取同一资源。
- reason：避免在 JavaScript、Swift、C# 中分别维护规则表造成算法漂移，同时保留完全离线、可复算、可追溯的结果 envelope。
- input boundary：起课时间为显式输入；梅花支持时间/数字；金口诀支持时间/指定地分/数字；太乙支持四计；择日要求事项与起止日期。
- output boundary：只输出盘面计算事实、来源、算法版本与限制，不生成 AI 自动判词。
- Windows boundary：当前单文件 WinForms 不新增脚本运行时，七个入口打开同目录离线 PWA；若未来要求原生窗口内嵌，需另行裁决 WebView2 依赖或 C# 原生移植。
- excluded：Horosa runtime、MCP、在线 API、名人库、七政四余、铁板神数、未闭合的第二批神数。
- validation：每种方法 3 个固定 golden，共 21 个；另有非法输入与重复稳定性检查。Apple 两端完成 Debug 构建，Windows 编译与四端人工视觉/交互仍待用户验收。

## ZHANBU-20260831-001

- date: 2026-08-31
- type: decision
- project: Zhanbu
- relates_to: none
- supersedes: none

### Summary

正式登记七种传统术数共用离线算法包及 Windows 外部 PWA 入口的既有决定。

### Decision

七种传统术数共用一个确定性适配层；PWA 直接加载，iOS/macOS 使用 JavaScriptCore，Windows 原生入口打开同目录离线 PWA。

### Reason

将本文件中 2026-08-29 的未编号既有决定纳入当前统一 Event ID 体系，使后续修订可以建立有效关系。

### Rejected

none

### Implementation

本文件顶部“2026-08-29 — 新增七种传统术数共用离线算法包”未编号记录；该实现立即由 ZHANBU-20260831-002 修订。

## ZHANBU-20260831-002

- date: 2026-08-31
- type: revision
- project: Zhanbu
- relates_to: ZHANBU-20260831-001
- supersedes: ZHANBU-20260831-001

### Summary

Windows 改为单 EXE 内嵌传统术数算法，不再依赖或打开外部 PWA。

### Decision

`Divination.bat` 与 `build.bat` 必须把由同一适配层生成的 Windows 兼容算法资源直接嵌入 `Divination.exe`；七种传统术数在 WinForms 主窗口内计算，生成后的 EXE 可脱离项目目录和 `Divination-PWA` 单独运行。

### Reason

用户确认 BAT 生成的 EXE 应直接具备全部算法；外部 PWA 文件夹依赖会导致 EXE 单独分发后新增算法不可用，也破坏 Windows 与 Mac 的使用一致性。

### Rejected

继续打开外部 `Divination-PWA`；要求用户另装 Node；引入需要额外分发文件的 WebView2 方案。

### Implementation

`Divination.cs`、`Divination.bat`、`build.bat`、`TraditionalAlgorithms/build-windows.mjs`、`TraditionalAlgorithms/windows-traditional-algorithms.js`、`README.md`、`ALGORITHM_SOURCES.md`、`TraditionalAlgorithms/README.md`。

## ZHANBU-20260831-003

- date: 2026-08-31
- type: decision
- project: Zhanbu
- relates_to: none
- supersedes: none

### Summary

接入国色华光雷诺曼差异扩展牌与完整复古神谕牌库，并复用现有特殊牌开关。

### Decision

复古神谕完整接入 52 张牌：49 张核心牌默认进入牌池，3 张植物强调牌在开启现有“包含特殊牌”时进入牌池；不新增开关。国色华光与现有雷诺曼语义不重复的 6 张扩展牌也仅在同一开关开启时启用。综合占卜加入三张复古神谕，但 AI 提示只给牌名、正逆位、领域和流向。

### Reason

保留现有雷诺曼牌库与用户已经习惯的单一特殊牌控制入口，同时让四端使用同一份完整神谕数据和一致的综合提示边界。

### Rejected

新增独立的国色华光或复古神谕特殊牌按钮；在综合 AI 提示中展开神谕细致牌义；把同义的国色华光经典牌作为重复牌加入现有雷诺曼牌池。

### Implementation

`Divination.cs`、`gen_data.py`、`Divination-PWA/`、`Divination-iOS/`、`Divination-macOS/`、`README.md`。
