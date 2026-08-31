# zhanbu — 占卜工具合集

个人占卜工具合集，基于 GitHub Pages 部署的纯静态 PWA，全部支持离线使用、可添加到手机主屏幕。

当前阶段、限制和下一步统一见 [`CURRENT_STATUS.md`](CURRENT_STATUS.md)。

## 项目结构与核心模块

仓库下是两个相互独立的产品，共用仓库级 `CURRENT_STATUS.md`：

```text
Zhanbu/
├── Divination/               # 综合占卜（多端架构）
│   ├── Divination.cs         # 原有模块的占卜词条与对应关系权威事实源
│   ├── TraditionalAlgorithms/# 新增传统术数统一适配、golden 与许可记录
│   ├── gen_data.py           # 确定性数据生成脚本（导出 PWA、iOS、WinForms 所需数据）
│   ├── Divination-PWA/       # 纯静态 PWA 源码（index.html, app.js, data.js, sw.js）
│   ├── Divination-iOS-macOS/ # 原生 Xcode 工程（Swift / SwiftUI）
│   ├── Divination-Windows/   # C# WinForms 桌面应用源码
│   └── README.md             # Divination 详细说明
├── Drawing/                  # 梵天神策摇签
│   ├── Drawing-PWA/          # 纯静态 PWA 源码（index.html, app.js, data.js, sw.js）
│   └── README.md             # Drawing 详细说明
└── CURRENT_STATUS.md         # 唯一当前状态文档
```

- **子项目定位**：
  - [**Divination**](Divination/)：十四模块综合占卜；原有模块以 `Divination.cs` 为静态事实源，新增奇门、大六壬、小六壬、梅花、太乙、金口诀、择日共用版本化离线算法包；
  - [**Drawing**](Drawing/)：梵天神策摇签（《灌顶梵天神策经》卷第十，固定 99 签、每签 8 句五言 + 白话译文）。
- **正式入口**：
  - Divination PWA：<https://lenyli.github.io/divinationLenyli.github.io/Divination/Divination-PWA/>（源码入口 `Divination/Divination-PWA/index.html`）；
  - Drawing PWA：`Drawing/Drawing-PWA/index.html`。
- **数据事实源**：`Divination/Divination.cs`（原有模块静态词条）、`Divination/TraditionalAlgorithms/adapter.ts`（新增术数统一结果适配）、`Drawing/Drawing-PWA/data.js`（99 签文事实）。

## 架构约束

- **100% 纯静态与完全离线**：两个 PWA 应用均由 `index.html + JavaScript + sw.js` 组成，无服务端、无云端数据库、无在线 AI。
- **单一数据源约束**：原有模块继续以 `Divination.cs` 为权威，禁止手改 `data.js` 或原生衍生表；新增七种术数以统一适配层和共用静态算法包为权威，禁止在 PWA、Swift、C# 分别维护口诀表。
- **Windows 单 EXE**：IE11 兼容算法已压缩写入 `Divination.cs`；用户侧只需 BAT + CS（图标可选），生成后的 EXE 不读取外部算法文件或 `Divination-PWA`。适配层变化时，开发者在 `TraditionalAlgorithms/` 运行 `pnpm run build:windows` 刷新 CS 内嵌载荷。
- **签文数量固定**：Drawing 严格遵循《灌顶梵天神策经》卷第十的 99 签，禁止增补第 100 签。
- **缓存升级一致性**：改动任何静态资源后，必须同步更新对应 `sw.js` 的缓存版本号与资源清单。

## 编码规范

通用编码规则遵循 `/Volumes/Leny/Projects/CLAUDE.md`。

本项目补充：
- **纯原生 Web 技术**：标准 HTML5 / CSS3 / 原生 ES6+ JavaScript，不引入庞大前端框架与打包器；
- **原生多端一致性**：Swift 与 C# 代码严格消费由 `gen_data.py` 生成的确定性结构；
- **离线 PWA 规范**：Service Worker 缓存策略遵循 `skills/pwa-app/SKILL.md`。

## 构建、测试与格式化

### 构建与数据生成

- **生成 Divination 各端数据**：
  ```bash
  python3 Divination/gen_data.py
  ```
- **Divination iOS 编译基线（Any iOS Device arm64）**：
  ```bash
  xcodebuild -project Divination/Divination-iOS-macOS/Divination.xcodeproj -scheme Divination -destination 'generic/platform=iOS' CODE_SIGNING_ALLOWED=NO build
  ```
- **Divination Windows 单 EXE**：在 Windows 双击 `Divination/Divination.bat` 或 `Divination/build.bat`；BAT 使用系统 `.NET Framework csc.exe` 编译 `Divination.cs`，不需要外部算法 JS（`Divination.ico` 仅为可选图标）。

### 本地运行与预览

- 纯静态站点无构建步骤。在项目根启动 HTTP 预览服务器：
  ```bash
  python3 -m http.server 8000
  ```
  浏览器访问 `http://localhost:8000/Divination/Divination-PWA/` 或 `http://localhost:8000/Drawing/Drawing-PWA/`。

### 测试与语法检查

- **JavaScript 语法检查**：
  ```bash
  node -c Divination/Divination-PWA/*.js Drawing/Drawing-PWA/*.js
  ```
- **Python 脚本语法检查**：
  ```bash
  python3 -m py_compile Divination/gen_data.py
  ```

### 格式化与检查

- 当前无独立强制格式化工具；不要为了 README 整理自行引入 formatter。

## 禁止修改与受保护路径

- **禁止修改**：
  - Drawing 99 签文传统经文事实；
- **只读事实源**：
  - `Divination/Divination.cs`（Divination 词条权威）；
- **生成物 / 不得手改**：
  - `Divination/Divination-PWA/data.js` 及各端由 `gen_data.py` 自动生成的 JSON/代码；
- **修改前需用户授权**：
  - 占卜算法与释义逻辑变动、起卦/摇签核心交互规则修改。

## 权限与安全策略

- **用户隐私与离线**：纯静态前端，无任何用户数据收集、上传或跟踪；
- **无凭据与秘密**：无 API Key、无 Secret、无服务端通信；
- **Git 操作**：所有 Git 操作一律由用户执行，AI 不得主动执行任何 Git 命令。

## 任务验收标准

任务完成至少满足：

1. **修改范围明确**：只修改本次需求直接相关的代码与文档，严禁顺手重构；
2. **数据一致性验证**：若改动 `Divination.cs`，重新运行 `gen_data.py` 并验证生成数据一致性；
3. **缓存版本同步**：若改动 PWA 静态资源，同步更新对应 `sw.js` 缓存版本与文件列表；
4. **语法检查通过**：JavaScript 与 Python 脚本通过语法检查（`node -c` / `python3 -m py_compile`）；
5. **记录同步**：项目事实发生变化时，最简覆盖更新项目根与 `/Volumes/Leny/ProjectRecord/Zhanbu/` 下的 `CURRENT_STATUS.md` 及 `README.md`，并同步更新 `/Volumes/Leny/Projects/PROJECT_NEXT.md` 中 Zhanbu 章节；
6. **人工验收标记**：页面交互动效、离线 PWA 安装与跨端排版需明确标记为“待用户验收”，不得冒充已验证；
7. **最终报告**：如实汇报修改文件、验证命令结果与真实限制。

## 当前能力

- Divination：原有六爻（支持随机与手动上卦/下卦/动爻）、塔罗、雷诺曼、卢恩、占星骰子、感应灵签与首页日期预测；新增奇门遁甲、大六壬、小六壬、梅花易数、太乙神数、金口诀、择日/黄历；提供 PWA、Windows、iOS、macOS 入口。
- Drawing：99 签摇筒出签、签文及白话译文，支持离线安装。

## 在线入口

- Divination：<https://lenyli.github.io/divinationLenyli.github.io/Divination/Divination-PWA/>
- Drawing：<https://lenyli.github.io/divinationLenyli.github.io/Drawing-PWA/>

## 安装到手机

1. 用 Safari（iOS）或 Chrome（Android）打开上面的入口链接
2. iOS：分享 → 添加到主屏幕；Android：菜单 → 安装应用
3. 首次打开即缓存全部资源，之后可完全离线使用

## Agent 与 Skill

- Agent：`frontend-developer`、`pwa-release-checker` 仅有平台适配文件；没有 canonical 项目 Agent 或 `.ai/manifest.yaml`，不视为跨工具常驻 Agent。
- Skill：当前没有已确认采用的项目或全局 Skill；全局 `pwa-app` 是后来从多个项目经验中提炼，不倒推为本项目既有使用记录。
- 全局索引：`/Volumes/Leny/ProjectRecord/Agents.md`、`/Volumes/Leny/ProjectRecord/Skills.md`。

## 项目规则

- 开始任务先读本文件与 `CURRENT_STATUS.md`；只维护本项目根及 `/Volumes/Leny/ProjectRecord/Zhanbu/`，不修改其他项目记录。
- 状态变化只覆盖更新两处 `CURRENT_STATUS.md`；不新建 progress、Next、Notes、HANDOFF 或 audit 状态文档。
- 状态变化时同步更新根 `PROJECT_NEXT.md` 中本项目的 `Updated` / `Current` / `Next` 并刷新 `Generated`；不得改其他项目章节。
- Divination 与 Drawing 保持独立；Divination 原有模块以 `Divination.cs` 为数据权威，新增术数共用版本化离线算法包；Drawing 固定 99 签。
- 修改静态资源后同步对应 `sw.js` 缓存清单与版本号。
