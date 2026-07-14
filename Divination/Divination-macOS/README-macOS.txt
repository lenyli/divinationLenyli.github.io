Divination macOS 版（Xcode 工程）
================================

一、构建运行
  1. 将 Divination-macOS 文件夹拷贝到 Mac 上
  2. 双击 Divination.xcodeproj 用 Xcode 打开（需 Xcode 14+，macOS 13+）
  3. 首次构建如提示签名：TARGETS → Divination → Signing & Capabilities 选择你的 Team（个人免费账号即可）
  4. 点击 ▶ Run；发布用 Product → Archive 或直接从 DerivedData 拷出 Divination.app

二、说明
  · 功能与 Windows 版完全一致：首页(综合占卜/日期预测)、六爻、塔罗(通用/YES OR NO/大牌+特殊牌开关)、
    雷诺曼、卢恩符文、占星骰子、玄天上帝感应灵签，历史记录30条持久保存、页面状态缓存
  · 数据表由 Divination.cs 自动转换（DivinationData.swift），未手工改动
  · 历史文件位置：~/Library/Application Support/Divination/history.dat（与Windows版同格式）
  · 界面为 SwiftUI 实现，粗体/斜体/红色/字号规则与 Windows 版一致
