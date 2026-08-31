# Zhanbu · Current Status

> 本文件是项目唯一状态文档。状态确有变化时只更新本文件；不要新建 progress、Next、Notes、HANDOFF 或 audit 状态文档。项目规则统一写在 `README.md`。

## 项目与硬约束

- Divination 与 Drawing 是同一项目下两个独立产品，均支持离线 PWA。
- Divination 以 `Divination.cs` 为权威数据来源。
- Drawing 固定为 99 签，不创建第 100 签。

## 当前完成状态

- Divination 与 Drawing 的 PWA 版本已完成并部署；Divination 另有 Windows、iOS、macOS 版本。
- 项目曾于 2026-08-31 由用户确认完成；随后发现 Windows EXE 无法独立使用新增算法，当前已重新进入 Windows 修复验收阶段。
- 2026-08-24 Divination 四端六爻页新增可选的手动起卦：上卦、下卦默认留空，动爻以“初、二、三、四、五、上”直接横排多选；全空时仍随机起卦，上下卦均选后严格使用手动卦象和动爻，不再随机掷币。
- 特殊塔罗牌名“真空秒有”已统一更正为“真空妙有”，并由 `Divination.cs` 重新生成到 PWA、iOS、macOS 数据文件。
- 2026-08-29 Divination 新增奇门遁甲、大六壬、小六壬、梅花易数、太乙神数、金口诀、择日/黄历：PWA 直接运行共用离线算法包，iOS/macOS 通过系统 JavaScriptCore 读取同一资源；不使用在线服务或 Horosa/MCP/API。
- 综合占卜已将奇门、大六壬、小六壬、梅花、太乙和金口诀归并为一版短摘要；日期预测接入奇门、六壬、梅花应期及按事项/日期范围筛选的黄历候选。太乙、金口诀、小六壬不强行换算为具体日期。
- 单项结果不再显示算法版本、来源与限制等开发信息；复算事实和来源仍保留在内部结果与 `Divination/ALGORITHM_SOURCES.md`、`Divination/TraditionalAlgorithms/` 中。
- PWA、iOS、macOS 和 Windows 应用图标已替换为用户提供的黑衣小魔法师原图，并按各平台尺寸生成；Windows 两个构建脚本会把 `Divination.ico` 嵌入 exe。
- 2026-08-31 iOS 结果框改为原生只读可选择文本视图：长按可拖动选区并只复制部分文字；“复制结果”按钮继续复制完整 `copyText`，两条复制路径互不替代。
- 2026-08-31 iOS 与 PWA 手机六爻输入改为两行：第一行保留上卦、下卦，第二行动爻“初、二、三、四、五、上”；手机导航及择日黄历原位置不变。macOS、Windows 和 PWA 桌面宽度下，择日／黄历移到第一排并紧跟灵签，第二排不再重复。
- 2026-08-31 Windows 七种传统术数改为 WinForms 主窗口内计算：兼容算法压缩载荷已直接写入 `Divination.cs`，用户侧 BAT 只需编译 CS（图标可选），生成后的 EXE 不再依赖外部算法 JS、读取或打开 `Divination-PWA`。Windows 增加 `EN／中文` 切换；“寻找对象”仅在所测何事选择“寻人寻物”时显示，与 macOS 条件一致。
- 2026-08-31 Windows 首页直接使用综合占卜，不再显示重复的“综合占卜”子按钮；输入区会根据当前模块紧凑上移，隐藏控件不再留下空白行；六爻手动选卦与“所测何事”两行均从窗口左侧起始，传统术数的起课时间和起卦／地分方式均按“文字：选项”从左到右排列。顶部各横排明确固定为从左到右且不换行，英文导航使用短标签，避免新增复古神谕后挤掉语言按钮。
- 2026-08-31 Windows 起课时间行进一步固定为“起课时间：”在日期时间框之前，日期时间框加宽以完整显示年月日和时分；所有原生日期下拉框隐藏“今天”前的标记矩形，打开或选定起课日期时会把时分秒刷新为当时的时间。
- 2026-08-31 四端新增“复古神谕”：完整接入 52 张，49 张核心牌默认启用，玫瑰／罂粟／橡树 3 张强调牌随现有“包含特殊牌”开关启用；没有新增按钮。综合占卜加入三张神谕，AI 提示只输出牌名、正逆位、领域与流向。
- 2026-08-31 雷诺曼保留原 43 张，并接入国色华光中与现有语义不重复的神灵、煞灵、财神、龙、花郎、女侠 6 张差异扩展牌；它们只在开启同一个“包含特殊牌”开关后进入牌池。
- 四端灵签简称统一为“玄天灵签”。桌面端复古神谕位于占星骰子之后；iOS 与 PWA 手机端位于第一行择日黄历之后，择日黄历位置未移动。

## 验证基线

- 2026-08-24 Divination PWA 的 app/data/service worker 完成 Node 语法检查，`gen_data.py --check` 确认 PWA、iOS、macOS 数据均与 `Divination.cs` 一致；Service Worker 缓存版本已更新为 `divination-v11`。
- 2026-08-24 Divination macOS generic Debug 与 iOS generic device Debug 构建通过，均关闭代码签名。
- 2026-08-29 新增传统术数算法包完成 21 个固定 golden（每种 3 个）、3 个非法输入检查与相同输入重复稳定性检查；`gen_data.py --check` 继续确认原有三端生成数据与 `Divination.cs` 一致。
- 2026-08-29 PWA `app.js` 与算法包完成 Node 语法检查，七种方法均返回摘要，奇门/六壬/梅花/黄历均返回日期参考字段；Service Worker 缓存更新为 `divination-v15`。
- 2026-08-29 macOS Debug、iOS 真机 Debug 与真机 Release 构建通过；iOS 构建确认生成 `AppIcon`、`Assets.car` 并包含共用算法资源。首次沙箱内 iOS 构建只因 CoreSimulator 服务权限失败，放开 Xcode 资源编译权限后通过。
- 2026-08-31 iOS 结果框局部选字修复完成静态回归检查、iOS Simulator Debug 与 Any iOS Device arm64 Release 构建；最终二进制确认包含 `SelectableResultText`。首次沙箱内 Simulator 构建只因 CoreSimulator 权限失败，放开权限后同一命令成功。
- 2026-08-31 本轮 PWA `app.js`、`sw.js` 通过 Node 语法检查，缓存更新为 `divination-v22`；`gen_data.py --check` 确认三端生成数据与 `Divination.cs` 一致。macOS arm64 Debug 与 Any iOS Device arm64 Release 构建通过。
- 2026-08-31 已更新未签名 `Divination/Divination.ipa`：Payload 为 iphoneos/arm64 `Divination.app`，版本 1.1 (1)，Bundle ID 为 `local.divination.app`、最低 iOS 16.0，包含本次手机六爻换行、局部选字、图标与算法资源；确认无 `_CodeSignature`、embedded mobileprovision、AppleDouble 或 `__MACOSX`，SHA-256 为 `ddc86c1277cbe6728594b45b144bc8a42f765690b3ef6aa95cd00394f841d7d5`。
- 2026-08-10 Drawing PWA 的 app/data/service worker 完成 Node 语法检查，ES module 也按 module 模式通过。
- `Drawing-PWA/data.js` 当前明确包含 99 签，末项 ID 为 99。
- 2026-08-31 Windows CS 内嵌兼容算法已与现有共用算法包对七种方法逐项差分，display/summary 全部一致；BAT 外部算法文件/PWA 依赖、条件式“寻找对象”和语言切换的源码红灯检查转绿，`gen_data.py --check` 继续通过。
- 2026-08-31 新牌库接入后 `gen_data.py --check` 通过，确认 `LENORMAND=49`、`ORACLE=52` 且 PWA/iOS/macOS 生成数据与 `Divination.cs` 一致；PWA 三个 JavaScript 文件通过语法检查，离线缓存更新为 `divination-v23`。
- 2026-08-31 iOS Any Device arm64 Release 与 macOS arm64 Release 构建通过。根目录未签名 `Divination.ipa` 已更新为 1.2 (2)，Payload 为 iphoneos/arm64、无 AppleDouble 或 `__MACOSX`，SHA-256 为 `a16d3562942d7b7bdad1628ef6c1a0f6bced1f9a0b4af60f4dbdedaab86b3731`。
- Divination Windows 端仍未在 Windows `.NET Framework csc.exe` 环境编译或启动；BAT 生成单 EXE及 WinForms 内部 WebBrowser 实际执行必须在 Windows 验收，不视为已经通过。四端视觉/交互、浏览器离线更新与 GitHub Pages 发布也未完成人工验收。

## 当前限制与下一步

1. 只带 BAT + CS 在 Windows 双击 `Divination.bat` 或 `build.bat`，确认生成并启动 `Divination.exe`；把 EXE 单独移出项目目录后，逐一排盘七种传统术数，确认不需要外部 JS 或 `Divination-PWA`。
2. 点验 Windows 紧凑输入布局、首页直接综合占卜、起课时间／方式选项顺序、`EN／中文` 切换，以及“寻找对象”仅在“寻人寻物”事项下出现。

## Agent 与 Skill

- `frontend-developer`、`pwa-release-checker` 只存在平台配置，未 canonical 化。
- 2026-08-29 使用 `research`、`implement` 与 `pwa-app` 完成来源核对、最小接入和离线缓存复核。
