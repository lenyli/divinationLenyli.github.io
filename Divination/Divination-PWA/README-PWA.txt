Divination PWA 版
================================

文件：index.html / app.js / data.js / manifest.webmanifest / sw.js / icons/

正式地址
  https://lenyli.github.io/divinationLenyli.github.io/Divination/Divination-PWA/

一、部署（PWA 需要 https 或 localhost 才能安装和离线）
  · 最简单：把 Divination-PWA 文件夹传到任意静态托管
    （GitHub Pages / Cloudflare Pages / Netlify，拖文件夹上去即可）
  · 本地试用：文件夹内运行  python -m http.server 8080
    然后浏览器打开 http://localhost:8080
  · 直接双击 index.html 也能用（仅普通网页模式，无法安装/离线）

二、安装
  · 手机 Safari：分享 → 添加到主屏幕
  · Chrome/Edge：地址栏右侧"安装"图标
  安装后全屏独立窗口运行，断网可用（Service Worker 缓存全部文件）

三、说明
  · 当前共十四个模块。第二排含六爻、奇门遁甲、大六壬、小六壬、
    梅花易数、太乙神数、金口诀、择日/黄历。
  · 新增七种传统术数全部使用本地离线算法包，不调用在线 API、MCP 或 AI 判词。
  · 支持子标签、特殊牌开关、页面状态缓存、每模块30条历史
    （localStorage 持久化）及复制提示“已复制”。不同设备的历史不会自动同步。
  · 标签自适应屏宽，第二排可横向滚动；深色模式自动适配。
  · 数据表 data.js 由 Divination.cs 自动转换；六爻算法已用固定掷币序列
    对照 Excel 缓存结果验证一致
  · 新增传统术数的口径、来源和限制见上一级 ALGORITHM_SOURCES.md。
