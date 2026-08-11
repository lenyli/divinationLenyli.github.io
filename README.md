# zhanbu — 占卜工具合集

个人占卜工具合集，基于 GitHub Pages 部署的纯静态 PWA，全部支持离线使用、可添加到手机主屏幕。

仓库下是两个相互独立的产品，共用仓库级 `CURRENT_STATUS.md`：

| 子项目 | 说明 | 文档 | 状态 |
| --- | --- | --- | --- |
| [**Divination**](Divination/) | 综合占卜：六爻 / 塔罗 / 雷诺曼 / 卢恩符文 / 占星骰子 / 玄天上帝感应灵签 / 首页日期预测。多端（Windows / PWA / iOS / macOS），以 `Divination.cs` 为唯一数据源 | [README](Divination/README.md) | **已完成** |
| [**Drawing**](Drawing/) | 梵天神策摇签：《灌顶梵天神策经》卷第十，99 签、每签 8 句五言 + 白话译文，带摇筒出签动画 | [README](Drawing/README.md) | **已完成** |

## 架构与技术

- Divination：`Divination.cs` 是权威数据源；`gen_data.py` 将数据生成到各端所需结构，PWA、iOS、macOS 和 Windows 外壳保持独立。
- Drawing：纯静态 PWA，签文位于 `Drawing-PWA/data.js`，逻辑与动画位于 `app.js` / `programmatic-scroll.js`。
- 两个 PWA 均由 `index.html + JavaScript + sw.js` 组成，无服务端和云端数据库。

## 当前能力

- Divination：六爻、塔罗、雷诺曼、卢恩符文、占星骰子、感应灵签与首页日期预测；提供 PWA、Windows、iOS、macOS 版本。
- Drawing：99 签摇筒出签、签文及白话译文，支持离线安装。

## 在线入口

- Divination：<https://lenyli.github.io/divinationLenyli.github.io/Divination-PWA/>
- Drawing：<https://lenyli.github.io/divinationLenyli.github.io/Drawing-PWA/>

## 安装到手机

1. 用 Safari（iOS）或 Chrome（Android）打开上面的入口链接
2. iOS：分享 → 添加到主屏幕；Android：菜单 → 安装应用
3. 首次打开即缓存全部资源，之后可完全离线使用

## 构建、开发与发布

两个应用都是纯静态站点，无构建步骤。本地预览：

```bash
python3 -m http.server 8000
```

PWA 的安装与离线需要 https 或 localhost，直接双击 `index.html` 只能当普通网页用。

推送到 `main` 分支后 GitHub Pages 自动发布。**改动任何静态资源后，记得同步对应 `sw.js` 的缓存清单与版本号**，否则老用户拿不到新文件。

## 当前状态

当前阶段、限制和下一步统一见 [`CURRENT_STATUS.md`](CURRENT_STATUS.md)。

## Agent 与 Skill

- Agent：`frontend-developer`、`pwa-release-checker` 仅有平台适配文件；没有 canonical 项目 Agent 或 `.ai/manifest.yaml`，不视为跨工具常驻 Agent。
- Skill：当前没有已确认采用的项目或全局 Skill；全局 `pwa-app` 是后来从多个项目经验中提炼，不倒推为本项目既有使用记录。
- 全局索引：`/Volumes/Leny/ProjectRecord/Agents.md`、`/Volumes/Leny/ProjectRecord/Skills.md`。

## 项目规则

- 开始任务先读本文件与 `CURRENT_STATUS.md`；只维护本项目根及 `/Volumes/Leny/ProjectRecord/Zhanbu/`，不修改其他项目记录。
- 状态变化只覆盖更新两处 `CURRENT_STATUS.md`；不新建 progress、Next、Notes、HANDOFF 或 audit 状态文档。
- 状态变化时同步更新根 `PROJECT_NEXT.md` 中本项目的 `Current` / `Next` 并刷新 `Generated`；不得改其他项目章节。
- Divination 与 Drawing 保持独立；Divination 以 `Divination.cs` 为数据权威，Drawing 固定 99 签。
- 修改静态资源后同步对应 `sw.js` 缓存清单与版本号。
