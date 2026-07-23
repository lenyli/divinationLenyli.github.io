# zhanbu — 占卜工具合集

个人占卜工具合集，基于 GitHub Pages 部署的纯静态 PWA，全部支持离线使用、可添加到手机主屏幕。

仓库下是**两个相互独立的小项目**，各自有自己的 README 与进度记录：

| 子项目 | 说明 | 文档 |
| --- | --- | --- |
| [**Divination**](Divination/) | 综合占卜：六爻 / 塔罗 / 雷诺曼 / 卢恩符文 / 占星骰子 / 玄天上帝感应灵签 / 首页日期预测。多端（Windows / PWA / iOS / macOS），以 `Divination.cs` 为唯一数据源 | [README](Divination/README.md) · [progress](Divination/progress.md) |
| [**Drawing**](Drawing/) | 梵天神策摇签：《灌顶梵天神策经》卷第十，99 签、每签 8 句五言 + 白话译文，带摇筒出签动画 | [README](Drawing/README.md) · [progress](Drawing/progress.md) |

## 在线入口

- Divination：<https://lenyli.github.io/divinationLenyli.github.io/Divination-PWA/>
- Drawing：<https://lenyli.github.io/divinationLenyli.github.io/Drawing-PWA/>

## 安装到手机

1. 用 Safari（iOS）或 Chrome（Android）打开上面的入口链接
2. iOS：分享 → 添加到主屏幕；Android：菜单 → 安装应用
3. 首次打开即缓存全部资源，之后可完全离线使用

## 开发与发布

两个应用都是纯静态站点，无构建步骤。本地预览：

```bash
python3 -m http.server 8000
```

PWA 的安装与离线需要 https 或 localhost，直接双击 `index.html` 只能当普通网页用。

推送到 `main` 分支后 GitHub Pages 自动发布。**改动任何静态资源后，记得同步对应 `sw.js` 的缓存清单与版本号**，否则老用户拿不到新文件。

## 记录

仓库级进度见 [`progress.md`](progress.md)；具体改动记在各子项目自己的 `progress.md` 里。
Obsidian 同步副本：`obsidian/Projects/zhanbu`。
