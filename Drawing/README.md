# Drawing — 梵天神策摇签

项目状态：已完成

记录类型：项目

## 项目资料

| 字段 | 内容 |
|---|---|
| 项目名称 | Drawing |
| 项目简介 | 基于梵天神策经文的摇签工具，提供 99 签的抽取与签文阅读，支持离线使用。 |
| 项目类型 | 软件 |
| 领域 | 梵天神策摇签 |
| 平台 | 浏览器 / PWA；可添加到手机主屏幕 |
| 技术 | HTML、CSS、JavaScript、Service Worker、Web Crypto；Python 仅生成 Excel 中间数据 |
| 架构 | 原始经文 → 99 签数据 → 纯静态离线 PWA；轮次、仪式、动画与本轮回看 |
| Agent | 当前无 canonical 项目 Agent；历史/平台配置见下文 |
| Skill | 当前无已确认采用的项目或全局 Skill |
| 源码 | /Volumes/Leny/Projects/Zhanbu/Drawing |
| 关联 | 与 Divination 同在 Zhanbu 合集，作为独立项目维护 |

资料来自本项目记录与能力清单；“已登记”不代表当前启用，“待确定”不等于读取失败。当前进度与验证以 CURRENT_STATUS.md 为准。

## 定位与范围

出自《灌顶梵天神策经》卷第十「梵天结愿神策」的摇签 PWA。纯静态、无构建步骤、无外部依赖，支持离线与添加到主屏幕。

在线入口：<https://lenyli.github.io/divinationLenyli.github.io/Drawing-PWA/>
（合集入口见 [`../README.md`](../README.md)，Divination 与本项目分开维护。）

### 功能

- **一轮 7 策**：每轮最多摇 7 签（`已探 N / 7 策`），满 3 签后才允许「刷新」开始新一轮
- **入轮仪式**：每轮首次摇签前弹出「灌顶无上偈颂」，诵过一次方可摇签；`resetRound` 后重新要求
- **触发方式**：点击「诚心摇签」或签筒，亦可**摇晃手机**（`devicemotion`，iOS 需授权）
- **出签动画**：签筒摇动 → 签支飞出 → 签牌翻转 → 卷轴展开显示偈颂（自定义元素 `programmatic-scroll`）
- **等概率随机**：`crypto.getRandomValues`，非 `Math.random`
- **本轮记录**：侧栏留存本轮已探签文与译文，可回看
- **经文缘起**：内置《灌顶梵天神策经》卷第十开篇原文
- **震动反馈**：`navigator.vibrate`（设备允许时）
- **竖屏/横屏**两套背景，移动端可在「签文 / 译文」视图间切换

## 架构与技术

### 资料核验依据

平台、技术与架构依据：[Drawing-PWA/manifest.webmanifest](</Volumes/Leny/Projects/Zhanbu/Drawing/Drawing-PWA/manifest.webmanifest>)、[Drawing-PWA/app.js](</Volumes/Leny/Projects/Zhanbu/Drawing/Drawing-PWA/app.js>)、[make_excel.py](</Volumes/Leny/Projects/Zhanbu/Drawing/make_excel.py>)。能力核对：项目根未发现 manifest、canonical Agent 或项目 Skill；沿用正文明确的无配置/未选型状态。核对包括既有 Agent 的 required-skills；供应商内嵌能力、历史适配和规划与项目当前配置分开登记。以上为源码/文档静态证据，运行与验收状态以 CURRENT_STATUS 为准。

### 签文数据

| 项 | 实际值 |
| --- | --- |
| 签数 | **99 签**（`data.js` 中 `LOTS`，`id` 1–99） |
| 每签 | **8 句五言**（即 4 组偈颂）+ 一段白话译文 |
| 原始出处 | `摇签.txt`，经文原文 + **398** 条编号五言偈句 |
| 中间产物 | `make_excel.py` → `梵天神策签文.xlsx` |

> 签数即为 **99**，没有第一百签。`摇签.txt` 末尾第 397、398 条是收束偈（「梵天说神策…」），不计入签文。

### 目录

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

## 运行与验证

### 开发

```bash
python3 -m http.server 8000
```

然后打开 `http://localhost:8000/Drawing-PWA/`。PWA 的安装与离线需要 https 或 localhost。

**改动素材或脚本后必须同步 `sw.js` 里的 `ASSETS` 白名单和 `?v=` 版本号**，否则离线缓存取不到新文件。

> `make_excel.py` 里的 `SRC`/`OUT` 仍是旧机器的 Windows 绝对路径（`D:\OneDrive\...`），在当前 Mac 上不能直接运行；如需重新生成需先改路径。

推送到 `main` 分支后 GitHub Pages 自动发布。

## Agent 与 Skill

Agent：当前无 canonical 项目 Agent；历史/平台配置见下文。

Skill：当前无已确认采用的项目或全局 Skill。

## 项目约束

遵守总规则；本项目保持完全离线的 PWA 数据与运行边界。静态资源变化同步本项目 Service Worker 清单及版本；不擅自引入服务端或在线 AI。

原始经文与 99 签数量保持不变；签文生成须先核实脚本输入输出路径，不能直接运行旧机器路径。

遵守总规则和以上项目边界；本次记录整理不改变产品状态或授权阶段。

## 记录与链接

README.md、CURRENT_STATUS.md 与 DECISION_EVENTS.md 的唯一编辑源为本目录，只维护本项目根，不向其他目录维护副本。

- 总规则：[CLAUDE.md](/Volumes/Leny/Projects/CLAUDE.md)
- 当前状态：[CURRENT_STATUS.md](/Volumes/Leny/Projects/Zhanbu/Drawing/CURRENT_STATUS.md)
- 决策历史：[DECISION_EVENTS.md](/Volumes/Leny/Projects/Zhanbu/Drawing/DECISION_EVENTS.md)
