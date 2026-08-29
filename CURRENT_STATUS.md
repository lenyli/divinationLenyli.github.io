# Zhanbu · Current Status

> 本文件是项目唯一状态文档。状态确有变化时只更新本文件；不要新建 progress、Next、Notes、HANDOFF 或 audit 状态文档。项目规则统一写在 `README.md`。

## 项目与硬约束

- Divination 与 Drawing 是同一项目下两个独立产品，均支持离线 PWA。
- Divination 以 `Divination.cs` 为权威数据来源。
- Drawing 固定为 99 签，不创建第 100 签。

## 当前完成状态

- Divination 与 Drawing 的 PWA 版本已完成并部署；Divination 另有 Windows、iOS、macOS 版本。
- 项目于 2026-07-29 完成。
- 2026-08-24 Divination 四端六爻页新增可选的手动起卦：上卦、下卦默认留空，动爻以“初、二、三、四、五、上”直接横排多选；全空时仍随机起卦，上下卦均选后严格使用手动卦象和动爻，不再随机掷币。
- 特殊塔罗牌名“真空秒有”已统一更正为“真空妙有”，并由 `Divination.cs` 重新生成到 PWA、iOS、macOS 数据文件。
- 2026-08-29 Divination 新增奇门遁甲、大六壬、小六壬、梅花易数、太乙神数、金口诀、择日/黄历：PWA 直接运行共用离线算法包，iOS/macOS 通过系统 JavaScriptCore 读取同一资源；Windows 原生入口打开同目录离线 PWA，未新增在线服务或 Horosa/MCP/API。
- 新增方法统一保留输入、算法版本、计算事实、来源与限制；没有添加 AI 自动判词。算法采用口径和许可证记录在 `Divination/ALGORITHM_SOURCES.md` 与 `Divination/TraditionalAlgorithms/`。

## 验证基线

- 2026-08-24 Divination PWA 的 app/data/service worker 完成 Node 语法检查，`gen_data.py --check` 确认 PWA、iOS、macOS 数据均与 `Divination.cs` 一致；Service Worker 缓存版本已更新为 `divination-v11`。
- 2026-08-24 Divination macOS generic Debug 与 iOS generic device Debug 构建通过，均关闭代码签名。
- 2026-08-29 新增传统术数算法包完成 21 个固定 golden（每种 3 个）、3 个非法输入检查与相同输入重复稳定性检查；`gen_data.py --check` 继续确认原有三端生成数据与 `Divination.cs` 一致。
- 2026-08-29 PWA `app.js` 与算法包完成 Node 语法检查，Service Worker 缓存更新为 `divination-v14` 并纳入算法资源；macOS Debug 与 iOS 模拟器 Debug 构建通过，构建产物内均确认存在 `traditional-algorithms.js`。
- 2026-08-10 Drawing PWA 的 app/data/service worker 完成 Node 语法检查，ES module 也按 module 模式通过。
- `Drawing-PWA/data.js` 当前明确包含 99 签，末项 ID 为 99。
- Divination Windows 端本轮未在 Windows `.NET Framework csc.exe` 环境编译；四端视觉/交互、浏览器离线更新与 GitHub Pages 发布尚未人工验收。

## 限制与下一步

1. 用户人工验收 PWA、macOS、iOS 新增七种方法的第二排标签、输入控件、长盘面排版、复制与历史记录；iOS 真机测试和 IPA 按用户明确口令再开始，本轮未生成 IPA。
2. 在 Windows `.NET Framework csc.exe` 环境编译启动 WinForms，确认七个入口能从 `Divination.exe` 同目录打开离线 PWA；当前 Mac 无 Windows C# 编译器。
3. 发布 PWA 后确认 `divination-v14` 能替换旧缓存，并在断网状态下加载 1.6 MB 算法包及完成七种排盘。
4. 继续保留 2026-08-24 六爻四端随机/手动分支的人工验收项。

## Agent 与 Skill

- `frontend-developer`、`pwa-release-checker` 只存在平台配置，未 canonical 化。
- 2026-08-29 使用 `research`、`implement` 与 `pwa-app` 完成来源核对、最小接入和离线缓存复核。
