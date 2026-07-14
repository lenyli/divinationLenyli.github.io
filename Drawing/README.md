# divinationLenyli.github.io

个人占卜工具合集,基于 GitHub Pages 部署的纯静态 PWA,全部支持离线使用、可添加到手机主屏幕。

## 应用列表

| 应用 | 说明 | 入口 |
| --- | --- | --- |
| Divination-PWA | 综合占卜:六爻 / 塔罗 / 雷诺曼 / 卢恩符文 / 占星骰子 / 玄天上帝感应灵签 | [打开](https://lenyli.github.io/divinationLenyli.github.io/Divination-PWA/) |
| Drawing-PWA | 梵天神策摇签:出自《灌顶梵天神策经》卷第十,梵天结愿神策二百签(每签两句五言偈),带摇筒出签动画 | [打开](https://lenyli.github.io/divinationLenyli.github.io/Drawing-PWA/) |

## Drawing-PWA(摇签)

- 默念所问之事,点击"诚心摇签"(或摇晃手机)触发
- 签筒摇动、签支弹出、签牌翻转,展示所得偈颂(竖排显示)
- 二百签等概率随机(`crypto.getRandomValues`)
- 支持震动反馈(设备允许时)
- 纯 HTML/CSS/JS,无任何构建步骤与外部依赖

## 安装到手机

1. 用 Safari(iOS)或 Chrome(Android)打开上面的入口链接
2. iOS:分享 → 添加到主屏幕;Android:菜单 → 安装应用
3. 首次打开后即缓存全部资源,之后可完全离线使用

## 目录结构

```
├── Divination-PWA/   # 综合占卜
├── Drawing-PWA/      # 梵天神策摇签
│   ├── index.html    # 页面与全部样式、动画
│   ├── app.js        # 摇签逻辑、摇晃手机触发
│   ├── data.js       # 二百签签文数据
│   ├── sw.js         # Service Worker 离线缓存
│   ├── manifest.webmanifest
│   └── icons/
└── README.md
```

## 开发

纯静态站点,本地预览任选一种:

```bash
python3 -m http.server 8000
# 或
npx serve .
```

推送到 `main` 分支后 GitHub Pages 自动发布。
