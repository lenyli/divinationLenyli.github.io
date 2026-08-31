Divination macOS 版（Xcode 工程）
================================

一、构建运行
  1. 将 Divination-macOS 文件夹拷贝到 Mac 上
  2. 双击 Divination.xcodeproj 用 Xcode 打开（需 Xcode 14+，macOS 13+）
  3. 首次构建如提示签名：TARGETS → Divination → Signing & Capabilities 选择你的 Team（个人免费账号即可）
  4. 点击 ▶ Run；发布用 Product → Archive 或直接从 DerivedData 拷出 Divination.app

二、说明
  · 功能与 Windows 版完全一致：首页(综合占卜)、六爻纳甲、塔罗(通用/YES OR NO/大牌+特殊牌开关)、
    雷诺曼、复古神谕、卢恩符文、占星骰子、玄天灵签，历史记录30条持久保存、页面状态缓存
  · 综合占卜合并六种传统术数短摘要；原日期预测已并入择日/黄历，
    同时输出塔罗/占星时长、奇门/六壬/梅花应期及完整黄历候选
  · 第一排标签中“择日/黄历”紧跟灵签；第二排从六爻开始排列其余传统术数
  · 复制结果统一为问题、可选事项与性别、方法、结果；不附算法来源、版本和限制说明
  · 除择日外，全部占卜方式都显示“所测何事”和“性别”；两项默认留空，婚恋／婚姻类必须选择性别
  · 单项结果不显示算法版本等开发信息；应用图标为黑衣小魔法师原图
  · 数据表由 Divination.cs 自动转换（DivinationData.swift），未手工改动
  · 历史文件位置：~/Library/Application Support/Divination/history.dat（与Windows版同格式）
  · 界面为 SwiftUI 实现，粗体/斜体/红色/字号规则与 Windows 版一致
