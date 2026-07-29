# Divination（综合占卜）进度记录

> 每次实质更新在此追加一条（最新在上）。上级记录见 [`../progress.md`](../progress.md)，Obsidian 同步副本：`obsidian/Projects/zhanbu`。

## 2026-07-29 · 项目标记为已完成

- **改了什么**：项目状态改为 **已完成**。功能与四端交付按现有进度收口；未提交的 git 改动仍由用户自行提交。
- **为什么改**：用户确认本项目已完成。
- **如何验证**：以本条及下方「当前状态」为准。

## 2026-07-27 · 清理废产物 + 新 Divination.bat

- **改了什么**：
  1. 删除构建/过期产物：`Divination.exe`、`DivinationOS.ipa`、`.derived-macos/`、`Divination-macOS/Divination/Divination.app`、日期快照文件夹与 zip、过时 `使用说明.txt`、旧自包含 `Divination.bat`。
  2. 新建 `Divination.bat`：用系统 `csc` 编译 `Divination.cs` → `Divination.exe` 并启动（`build.bat` 仍只负责编译）。
  3. PWA：删重复 `manifest.json`、两份 `IMG_0854.JPG`；`index.html` 只保留一份 manifest / apple meta / icon；`sw.js` → `v9`。
  4. 参考资料保留：`抽牌.xlsm`、`塔罗普通牌含义.xlsx`、`特殊牌.txt`；README 同步。
- **为什么改**：用户要求清废代码/文件；旧 bat 与 cs 脱节；PWA 头里双份 manifest/图标是历史残留。
- **如何验证**：根目录应无 exe/ipa/derived；有新的短 `Divination.bat`；PWA `index.html` 仅一处 `manifest.webmanifest`；参考资料三文件仍在。Windows 上双击 bat 应出 exe 并启动。

## 2026-07-27 · iOS 英文模块标签两行排版

- **改了什么**：英文模式下模块标签在 Lenormand / Runes 之间换行（上：Home…Lenormand；下：Runes…Slip）；中文仍单行。
- **为什么改**：手机英文标签挤在一行看不清。
- **如何验证**：iOS 切 EN，标签栏应两行显示。

## 2026-07-27 · macOS 应用图标

- **改了什么**：`Divination-macOS` 新增 `Assets.xcassets/AppIcon.appiconset`（小巫师图各尺寸），工程挂上 `ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon`。
- **为什么改**：用户提供图标，要求 mac 端使用。
- **如何验证**：Xcode 重新 Run；Dock / Finder 应显示新图标（若仍旧可清 DerivedData 或注销重登）。

## 2026-07-27 · 英文模式特殊牌选项另起一行（iOS + PWA）

- **改了什么**：英文 UI 下塔罗「Include special cards」不再挤在子标签同一横滑行里，改为下一行显示；中文布局不变。PWA `app.js`/`index.html` 同步；`sw.js` → `v8`。
- **为什么改**：手机英文文案较长，特殊牌开关被挤出看不见。
- **如何验证**：iOS/PWA 切 EN → 塔罗，开关应在标签下一行可见；切回中文仍与标签同行。

## 2026-07-27 · iOS / macOS 同步 PWA 多语言与特殊牌说明

- **改了什么**：
  1. 两端新增 `L10n.swift`（中英 UI 文案）与 `QianEnData.swift`（自 `qian-en.js` 生成的 49 签英译）。
  2. `Engine.swift`：系统语言自动选中/英（非中文→英）；`UserDefaults` 键 `divination_lang` 持久化手动切换；六爻无动爻显示「动爻无」/ `moving None`；灵签按语言选用 `QIAN` / `QIAN_EN`；其余 UI 结构标签随语言切换。
  3. `ContentView.swift`：语言切换按钮；启用「包含特殊牌」时弹说明（关闭不弹）。
  4. 两端 `project.pbxproj` 纳入新文件。
- **为什么改**：用户确认 PWA 效果后，要求 macOS / iOS 做同样更改。
- **如何验证**：
  - `xcodebuild` macOS Debug：**BUILD SUCCEEDED**
  - `xcodebuild` iOS Simulator Debug：**BUILD SUCCEEDED**
  - 手测：非中文系统默认英文；点「中文/EN」切换并重启仍保持；灵签 EN 见英文正文；六爻无动爻见「动爻无」；勾选特殊牌见弹窗。
- **假设**：牌名/卦名/雷诺曼等其它正文仍中文（与 PWA 一致）；签文英译与 PWA 同源。
- **仍未做**：未提交 git。

## 2026-07-27 · PWA 灵签全文英译 + 启用特殊牌弹窗说明

- **改了什么**：
  1. 新增 [`Divination-PWA/qian-en.js`](Divination-PWA/qian-en.js)：玄天灵签 49 签 × 12 字段英文意译（仅 PWA）；英文模式下 `qianTable()` 选用 `QIAN_EN`，中文仍用 `data.js` 的 `QIAN`。
  2. [`app.js`](Divination-PWA/app.js)：灵签模块与首页综合占卜末尾灵签按语言切换正文；去掉英文「正文仍为中文」提示；塔罗「包含特殊牌」勾选启用时弹出说明 modal（关闭不弹）；中英帮助文案同步补充特殊牌/AI 提示。
  3. [`index.html`](Divination-PWA/index.html)：引入 `qian-en.js`，新增 `#special-warn` modal。
  4. [`sw.js`](Divination-PWA/sw.js) 缓存 `divination-v6` → `v7`，并加入 `qian-en.js`。
- **为什么改**：英文模式此前只翻 UI 壳；用户要签文也英译先在 PWA 看效果。启用特殊牌时提醒：无特殊牌义解读包则不宜把特殊牌交给 AI。
- **如何验证**：
  - `node` 校验 `QIAN_EN.length===49` 且每签 12 字段、无汉字残留。
  - 本地 `http://localhost:8765`（硬刷新以绕过旧 SW）：切 EN → 灵签求签，正文为英文；切回中文为中文签文。
  - 塔罗-通用：勾选「包含特殊牌」弹出说明；取消勾选不弹。
- **覆盖范围**：QIAN 全部 49 签英译；第 42/43 签「解曰」与中文源一样截断，未臆补。未改 iOS/macOS/cs。
- **仍未做**：改动尚未提交 git；牌名/卦名等其它正文仍中文。

## 2026-07-27 · 签文「无挂碍」补修 + PWA 中英双语 + 六爻动爻无

- **改了什么**：
  1. 仅改数据源 [`Divination.cs`](Divination.cs) 第二十九签「岁小淹留无坚碍」→「无挂碍」（用户确认）；其他存疑项未动。
  2. 跑 [`gen_data.py`](gen_data.py) 回流 PWA / iOS / macOS。
  3. PWA 多语言（仅 PWA）：自动检测浏览器语言（中文→中文 UI，非中文→英文 UI）；右上角「EN / 中文」手动切换，优先于自动检测，写入 `localStorage`（`divination_lang`）；UI 壳子、标签、按钮、说明、六爻/占星结构标签等可切换；签诗、牌名、牌义、卦名等核心占卜内容保留中文。
  4. 六爻摘要：动爻列表为空时显示「动爻无」（英文 UI 为 `moving None`）。
  5. `Divination-PWA/sw.js` 缓存 `divination-v4` → `v6`。
- **为什么改**：用户确认「无挂碍」为正确用字；PWA 需给非中文环境用户提供英文界面壳子。
- **如何验证**：
  - `python3 gen_data.py --check` 三端与 cs 一致；grep「无挂碍」已在 cs 与三端数据就位。
  - 本地 `cd Divination-PWA && python3 -m http.server 8080`，打开 `http://localhost:8080`；中文浏览器默认中文 UI，改系统/浏览器语言为非中文或点「EN」切英文；刷新后语言保持；再点「中文」可切回。
  - 六爻模块多次起卦，遇无动爻时应显示「动爻无」而非空白。
- **假设**：签文/牌义无完整英文译本，英文模式仅翻译 UI 与结构标签，占卜正文保持中文；英文模式下灵签前显示 `(Fortune slip text in Chinese)` 提示。
- **仍未做**：改动尚未提交 git；iOS/macOS 原生端未加多语言。

## 2026-07-27 · 玄天灵签 OCR/录入错字批量修正并回流三端

- **改了什么**：
  1. 只改数据源 [`Divination.cs`](Divination.cs) 的 `QIAN`（玄天灵签 49 签）正文：高置信度 OCR/录入错字约 120+ 处（88+36 组替换规则），典型如「有绿→有缘」「综迹→踪迹」「沙裹→沙里」「世问→世间」「码杳→雁杳」「束方→东方」「一输→一轮」「乱如苏→乱如丝」「兔教→免教」「百事盒→百事宁」「归何肤→归何处」等。
  2. 跑 [`gen_data.py`](gen_data.py) 回流 PWA / iOS / macOS。
  3. `Divination-PWA/sw.js` 缓存 `divination-v3` → `v4`（否则已安装用户仍吃旧 `data.js`）。
- **为什么改**：签文数据源本身是 OCR/录入错字（如「有缘」写成「有绿」），不是「原文如此」；用户要求审查并修正高置信项，存疑不瞎改。
- **如何验证**：`python3 gen_data.py --check` 三端与 cs 一致；抽检「有缘造物 / 踪迹在江湖 / 沙里去淘金 / 雁杳鱼沉 / 一轮明月 / 凤凰巢 / 阴骘重」等均已就位，且 QIAN 内不再出现「有绿 / 综迹 / 沙裹 / 世问 / 码杳 / 束方」等已修错形；`肌肤 / 皮肤` 等正确用字保留；时间用语「寅卯待交辰巳日」未误改为「教」。
- **未改（存疑，待确认）**：
  - 「才方说起便**搂搜**」——谬悠 / 乱说 / 其他？
  - 「动起**冲牛**孰敢当。又**向**携持今在手」——是否「冲牛斗」「又得」？
  - 「除非舍去世间**脏**」——债 / 障 / 赃？
  - 「先祖作灾**述**」「无**坚**碍」「损折**岁见**」——语义未定
  - 「**家间**事」「天配如何**悟**世人」——或通，未动
  - 「良善慌慌意不**盗**」「小人**里**怪」等——把握不足
- **仍未做**：改动尚未提交 git。

## 2026-07-23 · 重写转换脚本，修完灵签乱码并回流三端

- **改了什么**：
  1. 新建 [`gen_data.py`](gen_data.py)——从 `Divination.cs` 解析 12 张数据表，生成 `Divination-PWA/data.js` 与 iOS、macOS 两份 `DivinationData.swift`；带 `--check` 只校验不写入。
  2. 修掉 `Divination.cs` 里剩余 6 处 `U+E5F1`：5 处直接替换为「处」；第 4 处按用户指正改为「命**蹇**时乖**处是**非」（原为「命赛时乖是`␥`非」，除补字外还纠正了 `赛`→`蹇` 与字序）。
  3. 跑脚本回流三端。
  4. `Divination-PWA/sw.js` 缓存版本 `divination-v2` → `v3`。该 SW 是 cache-first 且 `data.js` 无版本查询串，不升版本号的话已安装用户会一直吃旧数据，修复等于没生效。
- **为什么改**：`Divination.cs` 名义上是唯一数据源，但 cs→三端的转换脚本已遗失，导致 07-21 的修正躺在源文件里没生效，派生数据里的乱码也一直没人发现。没有可重复执行的转换，「单一数据源」形同虚设。
- **如何验证**：
  - **脚本保真度**：先用**未修改的 cs** 生成，与当时的三端文件逐字节比对——12 张表、缩进、引号、字典顺序、行尾全部一致，差异**只有当时已知的两处内容**（字符数 −1，即补「处」+1、删「．」−1），确认复现了原转换器行为。
  - **修复结果**：四份文件私用区乱码计数均为 **0**；`gen_data.py --check` 三端全部通过；7 处签文逐条 grep 确认新文本就位，第十六签多余全角点已清除。
  - **产物可用**：`node` eval `data.js` 通过，12 个常量条目数为 QIAN 49 / TAROT 197 / DATE12 12 / HEXAGRAMS 64 / LENORMAND 43 / RUNES 40 / POS 6 / TRI_ELEM 8 / PLANETS 12 / SIGNS 12 / HOUSES 12 / YESNO 22；Swift 侧数组条目数与括号闭合自检一致（508 行）。
- **仍未做**：`Divination.cs` 与本次改动都还**未提交 git**。

## 2026-07-23 · 建立子项目 README 与独立进度记录；查明 07-21 未提交改动

- **改了什么**：新建 `Divination/README.md`（此前只有各端 `README-*.txt` 与 `使用说明.txt`，无统一入口）与本进度文件。
- **为什么改**：`zhanbu` 下实为两个独立小项目，此前没有任何子项目级 README 与记录。
- **查明了一直挂着的疑问**：`Divination.cs` 于 2026-07-21 有改动但从未提交、内容无记录。`git diff` 显示实为 **4 处修改**：
  1. 玄天灵签第十五签「清光烁群星散」→「清光烁**处**群星散」（补回丢失的「处」）
  2. 第十六签「占身宜守旧，**．**失物不见」删去多余全角点
  3. 去掉文件开头的 UTF-8 BOM
  4. 补上文件末尾换行
- **如何验证**：`git diff -- Divination/Divination.cs` 为 `1 file changed, 4 insertions(+), 4 deletions(-)`；逐处比对确认如上。

### ⚠️ 由此发现的数据问题（未修，待处理）

顺着这处修正往下查，发现玄天灵签数据里有一个私用区乱码字符 **`U+E5F1`**，且**全部 7 处上下文都应该是「处」**：

| # | 上下文 | 应为 |
| --- | --- | --- |
| 1 | 夜静月明风细`␥`，空飘零落惹芳丛 | 处 |
| 2 | 清光烁`␥`群星散 | 处（07-21 已在 cs 修） |
| 3 | 失时无`␥`把身安 | 处 |
| 4 | 命赛时乖是`␥`非 | 处 |
| 5 | 月当明`␥`被云遮 | 处 |
| 6 | 不愁无`␥`获金珠 | 处 |
| 7 | 要知踪迹归何`␥` | 处 |

**07-21 只修了第 2 处**，当时现状是：

| 文件 | `U+E5F1` 残留 | 第十六签多余全角点 |
| --- | --- | --- |
| `Divination.cs`（源） | 6 | ✅ 已删 |
| PWA `data.js` | 7 | ❌ 仍在 |
| iOS `DivinationData.swift` | 7 | ❌ 仍在 |
| macOS `DivinationData.swift` | 7 | ❌ 仍在 |

验证方式：Python 扫描四份文件中 `U+E000–U+F8FF` 区间字符并打印上下文，计数如上。另把灵签 49 签 × 12 字段从四个文件抽出逐字段比对，cs 与三端**仅这 2 处不一致**，其余完全相同——说明历史上的转换本身可靠，只是这次改完没重跑。

> 以上问题已于同日全部修复，见本文件顶部记录（第 4 处按用户指正改为「命蹇时乖处是非」）。
>
> 更正：本文件初稿曾写「`Divination.cs` 乱码数为 0」，那是从单处 grep 推断的，未实测。实测为 6，已改正。

## 当前状态（2026-07-29，**已完成**）

**已完成**

- 七个模块：首页（综合占卜/日期预测）、六爻、塔罗（通用 / YES OR NO / 大牌 + 特殊牌开关）、雷诺曼（43 张抽 3 不重复）、卢恩符文（抽 3 不重复）、占星骰子（行星+星座+宫位）、玄天上帝感应灵签（49 签）
- 算法复刻自 `抽牌.xlsm`；六爻已用固定掷币序列对照 Excel 缓存结果验证一致
- 四端功能对齐：Windows（`Divination.cs` + `Divination.bat` / `build.bat`）、PWA、iOS、macOS（SwiftUI）
- 各端共有：子标签、页面状态缓存、每模块 30 条历史、结果一键复制；PWA / iOS / macOS 中英 UI；灵签英译；特殊牌启用说明
- PWA 深色模式自适配、符号化模块标签自适应屏宽；GitHub Pages 已发布
- `gen_data.py`（cs → 三端数据表，带 `--check`）；灵签乱码与一批 OCR 错字已修并回流；废构建产物已清

**非阻塞遗留（不挡结项）**

- 近期源码改动是否提交 git：由用户操作
- 参考资料保留：`抽牌.xlsm`、`塔罗普通牌含义.xlsx`、`特殊牌.txt`
- iOS 免费账号签名 7 天过期属平台限制，非功能缺口

> 2026-07-21 之前的详细过程无记录；上方为结项时状态。

## 2026-07-27 · PWA 玄天灵签英文签文

- **改了什么**：新增 `Divination-PWA/qian-en.js`，含全部 49 签 × 12 字段英文译本（诗意意译 + 解曰直译），结构对齐中文 `QIAN` / `_qian_zh.json`。
- **为什么改**：PWA 需要英文灵签数据文件。
- **如何验证**：`node` 加载 `QIAN_EN`，确认 length=49、每签 12 字段、无汉字残留（bad=0）。第 42/43 签解曰与中文同源截断，仅译已有部分。
