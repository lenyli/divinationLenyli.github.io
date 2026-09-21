# 占卜与摇签工具集 (Divination & Drawing)

> 纯静态、轻量化、支持完整离线运行的现代 Web / PWA 传统起卦与灵签工具集。

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen.svg)](https://lenyli.github.io/divinationLenyli.github.io/)
[![PWA](https://img.shields.io/badge/PWA-Offline%20Ready-orange.svg)](https://lenyli.github.io/divinationLenyli.github.io/)

## 项目简介

本项目收录了两套精心设计的传统术数与签文 Web 应用。项目整体采用纯静态前端架构，无需后端服务，支持 Service Worker 离线缓存，可直接安装至手机主屏幕或电脑桌面使用。

- 🌐 **总入口页面**：[https://lenyli.github.io/divinationLenyli.github.io/](https://lenyli.github.io/divinationLenyli.github.io/)

---

## 收录工具

### 1. 综合占卜工具 (Divination PWA)
- **体验地址**：[访问 Divination PWA](https://lenyli.github.io/divinationLenyli.github.io/Divination/Divination-PWA/)
- **功能特色**：
  - **多元牌卡与签文**：内置雷诺曼（含差异扩展牌）、经典神谕卡、塔罗以及诸仙佛神签文系统。
  - **传统术数算法**：内置梅花易数、六爻、太乙、奇门遁甲等传统起卦推演模型。
  - **零隐私泄露**：所有起卦计算和结果展示均在本地由 JavaScript 运算完成，不向网络上传任何占卜记录。

### 2. 梵天神策摇签 (Drawing PWA)
- **体验地址**：[访问 Drawing PWA](https://lenyli.github.io/divinationLenyli.github.io/Drawing/Drawing-PWA/)
- **功能特色**：
  - **源自经典**：出自《灌顶梵天神策经》卷第十「梵天结愿神策」，完整收录 99 签文与白话对照。
  - **仪式感交互**：入轮仪式、诵偈起签、动态掷杯、模拟竹筒摇签与卷轴缓展动画。
  - **一轮七策**：遵循古制以七策为一轮，支持本轮历史回看与签意研读。

---

## 本地运行

两套工具均为纯静态网页，无需编译环境或构建步骤：

1. 克隆本仓库到本地：
   ```bash
   git clone https://github.com/lenyli/divinationLenyli.github.io.git
   cd divinationLenyli.github.io
   ```

2. 启动静态 HTTP 服务器（任选其一）：
   ```bash
   # 使用 Python 内置服务
   python3 -m http.server 8080

   # 或使用 Node.js serve
   npx serve .
   ```

3. 在浏览器打开 `http://localhost:8080` 即可访问。

---

## 开源与第三方声明

本项目中的部分传统天文与术数算法使用了开源实现，详细许可与版权说明请参阅：
- [`Divination/Divination-PWA/THIRD_PARTY_NOTICES.txt`](Divination/Divination-PWA/THIRD_PARTY_NOTICES.txt)
