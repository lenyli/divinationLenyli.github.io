# 传统术数算法包

`adapter.ts` 是 Zhanbu 的统一结果适配层，`../Divination-PWA/traditional-algorithms.js` 是供四端复用的离线 IIFE 构建产物。

- 方法版本：`mingyu-core-0.1.32+zhanbu-2`
- 构建输入：Mingyu Core 0.1.32 与 tyme4ts 1.5.2 的 MIT 源码；它们只在构建时使用，产品运行时只有已吸收的自包含静态包
- 运行方式：PWA 直接加载；iOS/macOS 通过系统 JavaScriptCore 加载同一文件；Windows 从原生入口打开同目录的离线 PWA
- 网络边界：运行时不调用 Mingyu API、Horosa、MCP 或任何在线服务
- 更新规则：算法包、适配层、golden 摘要和 `Divination-PWA/sw.js` 缓存版本必须同步更新
- 用神／类神输入统一使用 `questionCategory`，婚恋类再传 `gender`，寻人寻物类再传 `searchTarget`。大六壬、小六壬、梅花、太乙和金口诀在同一适配层生成事项定位字段；梅花保持简化体用版，不混入六亲流派。

构建产物包含上游算法实现，相关许可全文见 [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md)。
