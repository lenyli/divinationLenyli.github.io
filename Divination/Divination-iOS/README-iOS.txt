Divination iOS 版（Xcode 工程）
================================

一、构建运行
  1. 将 Divination-iOS 文件夹拷贝到 Mac 上，双击 Divination.xcodeproj 打开（Xcode 14+，iOS 16+）
  2. TARGETS → Divination → Signing & Capabilities 选择你的 Team（个人免费账号即可）
  3. 顶部选择模拟器或连接的 iPhone → ▶ Run
  4. 真机安装后如提示"不受信任的开发者"：设置 → 通用 → VPN与设备管理 → 信任
     （免费账号签名的 App 有效期7天，到期重新 Run 一次即可；上架或长期使用需付费开发者账号）

二、说明
  · 首页采用四列标签布局：第一行首页／择日／空位／中英切换，下面三行排列其余占卜方式
  · 除择日外，全部占卜方式都显示“所测何事”和“性别”；两项默认留空，婚恋／婚姻类必须选择性别
  · 综合占卜合并六种传统术数短摘要；原日期预测已并入择日/黄历，
    同时输出塔罗/占星时长、奇门/六壬/梅花应期及完整黄历候选
  · 单项结果不显示算法版本等开发信息；应用图标为黑衣小魔法师原图
  · 数据表 DivinationData.swift 与 macOS 版相同（由 Divination.cs 自动转换）
  · 历史记录存于 App 沙盒 Application Support/Divination/history.dat，保存30条
  · 使用说明含第5条"复制结果可直接粘贴到AI解读"（与你更新的cs一致）
