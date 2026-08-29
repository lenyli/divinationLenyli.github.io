# Zhanbu Decision Events

## 2026-08-29 — 新增七种传统术数共用离线算法包

- decision：奇门遁甲、大六壬、小六壬、梅花易数、太乙神数、金口诀、择日/黄历共用一个版本化结果适配层和静态算法包；PWA 直接加载，iOS/macOS 通过系统 JavaScriptCore 读取同一资源。
- reason：避免在 JavaScript、Swift、C# 中分别维护规则表造成算法漂移，同时保留完全离线、可复算、可追溯的结果 envelope。
- input boundary：起课时间为显式输入；梅花支持时间/数字；金口诀支持时间/指定地分/数字；太乙支持四计；择日要求事项与起止日期。
- output boundary：只输出盘面计算事实、来源、算法版本与限制，不生成 AI 自动判词。
- Windows boundary：当前单文件 WinForms 不新增脚本运行时，七个入口打开同目录离线 PWA；若未来要求原生窗口内嵌，需另行裁决 WebView2 依赖或 C# 原生移植。
- excluded：Horosa runtime、MCP、在线 API、名人库、七政四余、铁板神数、未闭合的第二批神数。
- validation：每种方法 3 个固定 golden，共 21 个；另有非法输入与重复稳定性检查。Apple 两端完成 Debug 构建，Windows 编译与四端人工视觉/交互仍待用户验收。
