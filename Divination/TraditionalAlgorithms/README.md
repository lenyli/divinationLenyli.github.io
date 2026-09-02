# 传统术数算法包

`adapter.ts` 是 Zhanbu 的统一结果适配层，`../Divination-PWA/traditional-algorithms.js` 是供 PWA、iOS、macOS 复用的离线 IIFE 构建产物；Windows 从同一适配层生成兼容代码，压缩后直接写入 `../Divination.cs`。

- 适配层源码版本：`mingyu-core-0.1.32+zhanbu-3`
- 当前 PWA/Apple 构建产物版本：`mingyu-core-0.1.32+zhanbu-3`；Windows 内嵌载荷仍须运行 `pnpm run build:windows` 后同步
- 构建输入：Mingyu Core 0.1.32 与 tyme4ts 1.5.2 的 MIT 源码；它们只在构建时使用，产品运行时只有已吸收的自包含静态包
- 运行方式：PWA 直接加载；iOS/macOS 通过系统 JavaScriptCore 加载同一文件；Windows 使用 `build-windows.mjs` 从同一适配层刷新 `Divination.cs` 内的 IE11 兼容代码，用户侧 BAT 只需编译 CS
- 网络边界：运行时不调用 Mingyu API、Horosa、MCP 或任何在线服务
- 更新规则：算法包、适配层、golden 摘要和 `Divination-PWA/sw.js` 缓存版本必须同步更新；任一未同步时不得把源码修复描述成已完成的运行时验收
- Windows 代码：适配层变化后运行 `pnpm run build:windows`，脚本会机械刷新 `Divination.cs` 中带标记的压缩载荷；不产生 BAT 所需的外部 JS，EXE 运行时也不读取 PWA 目录
- 用神／类神输入统一使用 `questionCategory`，婚恋类再传 `gender`，寻人寻物类再传 `searchTarget`。六爻只在候选唯一时自动取用；大六壬保留类神候选与原始天地盘；小六壬不从口诀关键词推断；太乙不按主客算数值判胜负；金口诀不自动把候选当唯一用神；梅花保持简化体用版，不混入六亲流派。

构建产物包含上游算法实现，相关许可全文见 [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md)。
