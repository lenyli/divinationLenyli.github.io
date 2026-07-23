# Drawing — 梵天神策摇签

出自《灌顶梵天神策经》卷第十「梵天结愿神策」的摇签 PWA。纯静态、无构建步骤、无外部依赖，支持离线与添加到主屏幕。

在线入口：<https://lenyli.github.io/divinationLenyli.github.io/Drawing-PWA/>
（站点级说明与另一个应用见仓库根目录 [`../README.md`](../README.md)）

## 签文数据

| 项 | 实际值 |
| --- | --- |
| 签数 | **99 签**（`data.js` 中 `LOTS`，`id` 1–99） |
| 每签 | **8 句五言**（即 4 组偈颂）+ 一段白话译文 |
| 原始出处 | `摇签.txt`，经文原文 + **398** 条编号五言偈句 |
| 中间产物 | `make_excel.py` → `梵天神策签文.xlsx` |

> ⚠️ **待确认**：原经文自述「出梵天结愿**一百**偈颂」，`摇签.txt` 共 398 条编号偈句。当前按每签 4 组切分得 99 签（99 × 4 = 396），**剩余第 397、398 两条未进入 `data.js`**，第 100 签疑似因偈句不足而被丢弃。需要核对原始经文是否本就缺 2 句，还是 `摇签.txt` 抄录时漏了。
>
> 另注：旧版 README 曾写「二百签，每签两句五言偈」，与代码不符，已按 `data.js` 实际结构更正。

## 功能

- **一轮 7 策**：每轮最多摇 7 签（`已探 N / 7 策`），满 3 签后才允许「刷新」开始新一轮
- **入轮仪式**：每轮首次摇签前弹出「灌顶无上偈颂」，诵过一次方可摇签；`resetRound` 后重新要求
- **触发方式**：点击「诚心摇签」或签筒，亦可**摇晃手机**（`devicemotion`，iOS 需授权）
- **出签动画**：签筒摇动 → 签支飞出 → 签牌翻转 → 卷轴展开显示偈颂（自定义元素 `programmatic-scroll`）
- **等概率随机**：`crypto.getRandomValues`，非 `Math.random`
- **本轮记录**：侧栏留存本轮已探签文与译文，可回看
- **经文缘起**：内置《灌顶梵天神策经》卷第十开篇原文
- **震动反馈**：`navigator.vibrate`（设备允许时）
- **竖屏/横屏**两套背景，移动端可在「签文 / 译文」视图间切换

## 目录

```
Drawing/
├── 摇签.txt              # 原始经文与 398 条编号偈句（数据源头）
├── make_excel.py         # 摇签.txt → Excel（注意：内含 Windows 绝对路径，见下）
├── 梵天神策签文.xlsx      # 中间产物
├── art/                  # 美术源素材（签筒、卷轴、莲纹、背景等）
└── Drawing-PWA/          # 实际发布的应用
    ├── index.html        # 页面 + 全部样式与动画
    ├── app.js            # 摇签逻辑、轮次、摇晃触发
    ├── data.js           # 99 签签文与译文
    ├── programmatic-scroll.js  # 卷轴展开自定义元素
    ├── sw.js             # Service Worker 离线缓存（ASSETS 白名单）
    ├── manifest.webmanifest
    ├── assets/           # 运行时素材（含法华文楷字体）
    └── icons/
```

## 开发

```bash
python3 -m http.server 8000
```

然后打开 `http://localhost:8000/Drawing-PWA/`。PWA 的安装与离线需要 https 或 localhost。

**改动素材或脚本后必须同步 `sw.js` 里的 `ASSETS` 白名单和 `?v=` 版本号**，否则离线缓存取不到新文件。

> `make_excel.py` 里的 `SRC`/`OUT` 仍是旧机器的 Windows 绝对路径（`D:\OneDrive\...`），在当前 Mac 上不能直接运行；如需重新生成需先改路径。

推送到 `main` 分支后 GitHub Pages 自动发布。
