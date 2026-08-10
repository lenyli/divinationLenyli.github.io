# Zhanbu · Current Status

> 本文件是项目唯一状态文档。状态确有变化时只更新本文件；不要新建 progress、Next、Notes、HANDOFF 或 audit 状态文档。项目规则统一写在 `README.md`。

## 项目与硬约束

- Divination 与 Drawing 是同一项目下两个独立产品，均支持离线 PWA。
- Divination 以 `Divination.cs` 为权威数据来源。
- Drawing 固定为 99 签，不创建第 100 签。

## 当前完成状态

- Divination 与 Drawing 的 PWA 版本已完成并部署；Divination 另有 Windows、iOS、macOS 版本。
- 项目于 2026-07-29 完成。

## 验证基线

- 2026-08-10 对两套 PWA 的 app/data/service worker 脚本完成 Node 语法检查；Drawing 的 ES module 也按 module 模式通过。
- `Drawing-PWA/data.js` 当前明确包含 99 签，末项 ID 为 99。
- 本轮未重新构建 iOS/macOS App，也未重新执行浏览器离线安装与 GitHub Pages 发布验收。

## 限制与下一步

1. 当前无待办，仅在出现明确维护需求时恢复。

## Agent 与 Skill

- `frontend-developer`、`pwa-release-checker` 只存在平台配置，未 canonical 化。
- 当前无确认采用的 Skill；`pwa-app` 是后来从本项目等实践提炼，不算当时已使用。
