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

## 验证基线

- 2026-08-24 Divination PWA 的 app/data/service worker 完成 Node 语法检查，`gen_data.py --check` 确认 PWA、iOS、macOS 数据均与 `Divination.cs` 一致；Service Worker 缓存版本已更新为 `divination-v11`。
- 2026-08-24 Divination macOS generic Debug 与 iOS generic device Debug 构建通过，均关闭代码签名。
- 2026-08-10 Drawing PWA 的 app/data/service worker 完成 Node 语法检查，ES module 也按 module 模式通过。
- `Drawing-PWA/data.js` 当前明确包含 99 签，末项 ID 为 99。
- Divination Windows 端本轮未在 Windows `.NET Framework csc.exe` 环境编译；四端视觉/交互、浏览器离线更新与 GitHub Pages 发布尚未人工验收。

## 限制与下一步

1. 用户人工验收 Windows、macOS、iOS、PWA 六爻栏布局，以及“全空随机、完整手动输入不再随机”的行为。
2. 在 Windows `.NET Framework csc.exe` 环境编译并启动 WinForms 版本。
3. 发布 PWA 后确认 `divination-v11` 能替换旧缓存并完成离线打开。

## Agent 与 Skill

- `frontend-developer`、`pwa-release-checker` 只存在平台配置，未 canonical 化。
- 当前无确认采用的 Skill；`pwa-app` 是后来从本项目等实践提炼，不算当时已使用。
