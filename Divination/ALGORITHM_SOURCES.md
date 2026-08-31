# 新增占卜方法：算法来源与采用边界

## Context & Objective

本轮接入奇门遁甲、大六壬、小六壬、梅花易数、太乙神数、金口诀与择日/黄历。目标是让现有入口形成可复算、离线、可追溯的计算链；不接 Horosa runtime、MCP、在线 API、AI 自动判词或未闭合的神数方法。

## Core Findings & Evidence

| 方法 | 首版口径 | 主要实现依据 | 结果事实 |
|---|---|---|---|
| 奇门遁甲 | 时家、转盘、拆补法 | Mingyu Core `qimen`；《烟波钓叟歌》《遁甲演义》 | 阴阳遁、局数、值符值使、九宫天地人神盘、空亡驿马、格局标签 |
| 大六壬 | 月将加时、四课三传 | Mingyu Core `liuren`；Taibu 仅作独立结构复核；《大六壬大全》等 | 月将、贵人、旬空、四课、三传、九宗门取传事实 |
| 小六壬 | 农历月日时三步 | Mingyu Core `xiaoliuren` | 月宫、日宫、时宫、三段种子与换日/闰月口径 |
| 梅花易数 | 时间与数字起卦 | Mingyu Core `meihua`；《梅花易数》通行本 | 主互变卦、动爻、体用、旺衰与复算参数 |
| 太乙神数 | 年/月/日/时四计七十二局基础盘 | Mingyu Core `taiyi`；Kintaiyi 固定版本交叉核对；《太乙金镜式经》 | 积数、阴阳遁、局数、太乙/文昌/始击/计神位置、主客定算 |
| 金口诀 | 时间、指定地分、数字起课 | Mingyu Core `jinkoujue`；《六壬神课金口诀》相关规则 | 四位、阴阳取用、五动三动、旬空与复算输入 |
| 择日/黄历 | 事项+起止日期，最多180天 | Mingyu Core `almanac`；《协纪辨方书》《象吉通书》规则范围 | 建除、十二神、冲煞、宜忌支持/限制与候选排序 |

上游许可：Mingyu Core 0.1.32、tyme4ts 1.5.2 与 Windows 兼容资源内嵌的 core-js 3.50.0 均为 MIT；许可全文随产品源码保留在 `TraditionalAlgorithms/THIRD_PARTY_NOTICES.md`。Taibu 和 Kintaiyi 只用于核对，没有作为运行时组件接入。

## Trade-offs & Limitations

- 盘面输出保留事实、来源、算法版本与限制，不生成 AI 自动断语。
- 用神／类神层只做固定查表与盘面定位：六爻按八宫五行和纳甲地支配六亲并查本宫首卦伏神；大六壬补齐十二天将后定位类神；小六壬抽取主宫口诀对应分句；梅花保持简化体用；太乙映射主客算语义；金口诀按日干五行配置四位六亲。事项定位随结构化结果输出，不调用 AI 二次判断。
- 奇门首版固定时家转盘拆补；飞盘、置闰、日家/月家/年家未开放为 UI 选项。
- 金口诀未开放随机起课，避免不可复算的随机结果。
- 择日未输入参与人生辰时，不计算个人刑冲破害，并在结果中明确提示。
- Windows WinForms 的 `Divination.cs` 已内含由同一适配层生成的 IE11 兼容算法压缩载荷，BAT 只编译 CS，由窗口内部的系统 WebBrowser 脚本引擎执行；编译及运行均不需要外部算法 JS 或 `Divination-PWA`，移动或分发时只需 EXE。

## Recommendations / Decision Inputs

- 后续每次算法升级都先更新统一适配层和 golden 摘要，再替换四端共用构建产物。
- Windows 结果已回到原生 WinForms 主窗口；为保持单 EXE 与算法一致性，采用系统自带 WebBrowser 执行 CS 内嵌兼容代码，不引入 WebView2、Node、外部算法文件或 PWA 运行依赖。
- 新增第二批方法前，仍以“算法链闭合、输入完整、可复算、有来源”为准入条件。

## Citations

- Mingyu Core：<https://github.com/Brhiza/mingyu/tree/main/packages/core>
- Mingyu 奇门、大六壬、梅花、小六壬、金口诀、择日源码目录：<https://github.com/Brhiza/mingyu/tree/main/packages/core/src/divination/algorithms>
- Mingyu 太乙源码：<https://github.com/Brhiza/mingyu/tree/main/packages/core/src/taiyi>
- Taibu 大六壬计算：<https://github.com/hhszzzz/taibu/blob/master/packages/core/src/domains/daliuren/calculate.ts>
- Kintaiyi 固定核对版本：<https://github.com/kentang2017/kintaiyi/tree/9842d8f35e895ea6f09e9787edf6da5c16fab91b>
- core-js：<https://github.com/zloirock/core-js>
