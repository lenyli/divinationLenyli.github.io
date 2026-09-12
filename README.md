# Zhanbu — 占卜工具合集入口

记录类型：合集入口

Divination 与 Drawing 是两个独立项目，各自在自己的目录维护 README、CURRENT_STATUS、DECISION_EVENTS，在 ProjectRecord 分别登记。Zhanbu 只保留目录与站点入口，不拥有第三份产品状态或决定版本。

| 独立项目 | 定位 | 项目事实源 | PR 副本 |
|---|---|---|---|
| Divination | 多端综合占卜工具 | [README](Divination/README.md) · [状态](Divination/CURRENT_STATUS.md) · [Events](Divination/DECISION_EVENTS.md) | [/ProjectRecord/Divination](/Volumes/Leny/ProjectRecord/Divination/README.md) |
| Drawing | 梵天神策 99 签 PWA | [README](Drawing/README.md) · [状态](Drawing/CURRENT_STATUS.md) · [Events](Drawing/DECISION_EVENTS.md) | [/ProjectRecord/Drawing](/Volumes/Leny/ProjectRecord/Drawing/README.md) |

## 共用约束

- 遵守 [总规则](/Volumes/Leny/Projects/CLAUDE.md)，进入具体项目后阅读其 README 与 CURRENT_STATUS。
- 两项目独立维护；Divination 原有词条以 Divination.cs 为源、新术数以共享适配层为源；Drawing 以自身经文为源，固定 99 签。
- PWA 静态资源变化须同步对应 Service Worker 清单与缓存版本，保持离线能力。
- 不从历史平台 Agent 文件推断两个项目已配置或正在运行 Agent；各项目 README 明确能力状态。
- 本次只拆分记录与 PR 索引，未调整仓库、源码、部署路径、数据文件或产物，也不重开已完成项目。

## 站点入口

- [Divination PWA](https://lenyli.github.io/divinationLenyli.github.io/Divination/Divination-PWA/)
- [Drawing PWA](https://lenyli.github.io/divinationLenyli.github.io/Drawing-PWA/)

产品事实以各子项目记录为准；本次未重新访问线上站点。
