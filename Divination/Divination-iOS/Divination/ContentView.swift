import SwiftUI

let selectedColor = Color(red: 0.69, green: 0.77, blue: 0.87) // LightSteelBlue

func render(_ segs: [Seg], baseSize: CGFloat = 15) -> AttributedString {
    var a = AttributedString()
    for s in segs {
        var t = AttributedString(s.text)
        var font = Font.system(size: baseSize + (s.big ? 2 : 0))
        if s.bold { font = font.bold() }
        if s.italic { font = font.italic() }
        t.font = font
        if s.red { t.foregroundColor = .red }
        a += t
    }
    return a
}

struct TabButton: View {
    let title: String
    let selected: Bool
    var expand = false
    var fontSize: CGFloat = 14
    let action: () -> Void
    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.system(size: fontSize))
                .lineLimit(1)
                .minimumScaleFactor(0.6)
                .padding(.horizontal, expand ? 2 : 10).padding(.vertical, 6)
                .frame(maxWidth: expand ? .infinity : nil)
                .background(selected ? selectedColor : Color(UIColor.secondarySystemBackground))
                .foregroundColor(.primary)
                .cornerRadius(6)
        }
        .buttonStyle(.plain)
    }
}

// 模块标签（历史/标题仍用全名）
let modIcons = ["首页", "六爻", "塔罗", "雷诺曼", "卢恩", "占星", "灵签"]

struct ContentView: View {
    @StateObject var eng = Engine()
    @State private var showHistory = false
    @State private var showHelp = false

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            // 模块行（自适应铺满屏宽）
            HStack(spacing: 4) {
                ForEach(0..<modIcons.count, id: \.self) { i in
                    TabButton(title: modIcons[i], selected: eng.curModule == i, expand: true, fontSize: 15) { eng.switchModule(i) }
                }
            }
            // 子标签行
            if eng.curModule == 2 {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 6) {
                        ForEach(0..<eng.tarotTabs.count, id: \.self) { i in
                            TabButton(title: eng.tarotTabs[i], selected: eng.curTab == i) { eng.switchTab(i) }
                        }
                        Toggle("包含特殊牌", isOn: $eng.includeSpecial)
                            .fixedSize()
                            .onChange(of: eng.includeSpecial) { _ in eng.resetTarotSessions() }
                    }
                }
            }
            if eng.curModule == 0 {
                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 6) {
                        ForEach(0..<eng.homeTabs.count, id: \.self) { i in
                            TabButton(title: eng.homeTabs[i], selected: eng.curHomeTab == i) { eng.switchHomeTab(i) }
                        }
                    }
                    if eng.curHomeTab == 1 {
                        Text("未作校准，仅供参考，自行甄别").bold().foregroundColor(.red).font(.system(size: 13))
                    }
                }
            }
            // 输入
            HStack {
                Text("输入问题：").font(.system(size: 15))
                TextField("", text: $eng.question)
                    .textFieldStyle(.roundedBorder)
                    .onSubmit { eng.divine() }
            }
            // 按钮行（自适应铺满屏宽）
            HStack(spacing: 6) {
                Group {
                    Button(eng.goButtonText) { eng.divine() }.buttonStyle(.borderedProminent)
                    Button("复制结果") { eng.copyResult() }.buttonStyle(.bordered)
                    Button("清空") { eng.clearPage() }.buttonStyle(.bordered)
                    Button("历史") { showHistory = true }.buttonStyle(.bordered)
                    Button("说明") { showHelp = true }.buttonStyle(.bordered)
                }
                .lineLimit(1)
                .minimumScaleFactor(0.6)
                .frame(maxWidth: .infinity)
            }
            // 输出
            ScrollView {
                Text(render(eng.output))
                    .textSelection(.enabled)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(8)
            }
            .background(Color(UIColor.systemBackground))
            .overlay(RoundedRectangle(cornerRadius: 6).stroke(Color.gray.opacity(0.4)))
        }
        .padding(12)
        .overlay { CopiedToast(show: eng.showCopied) }
        .sheet(isPresented: $showHistory) {
            HistoryView(eng: eng, module: eng.curModule)
        }
        .alert("使用说明", isPresented: $showHelp) {
            Button("确定", role: .cancel) {}
        } message: {
            Text(eng.helpText)
        }
    }
}

struct HistoryView: View {
    @ObservedObject var eng: Engine
    let module: Int
    @Environment(\.dismiss) private var dismiss

    var attributed: AttributedString {
        var a = AttributedString()
        let h = eng.histories[module]
        for (i, item) in h.enumerated() {
            if let r = item.range(of: "  ") {
                var ts = AttributedString(String(item[item.startIndex..<r.lowerBound]))
                ts.font = .system(size: 15).bold()
                a += ts
                a += AttributedString(String(item[r.lowerBound...]))
            } else {
                a += AttributedString(item)
            }
            if i < h.count - 1 { a += AttributedString("\n\n") }
        }
        return a
    }

    var body: some View {
        NavigationView {
            VStack(alignment: .leading, spacing: 10) {
                ScrollView {
                    Text(attributed)
                        .textSelection(.enabled)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(8)
                }
                .background(Color(UIColor.systemBackground))
                .overlay(RoundedRectangle(cornerRadius: 6).stroke(Color.gray.opacity(0.4)))
                HStack {
                    Button("复制全部") {
                        let h = eng.histories[module]
                        if !h.isEmpty { Engine.toClipboard(h.joined(separator: "\n\n")); eng.flashCopied() }
                    }.buttonStyle(.bordered)
                    Button("清除全部") { eng.clearHistory(module: module) }.buttonStyle(.bordered)
                    Spacer()
                }
            }
            .padding(12)
            .navigationTitle("历史 - \(eng.mods[module])")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("关闭") { dismiss() }
                }
            }
        }
        .overlay { CopiedToast(show: eng.showCopied) }
    }
}

struct CopiedToast: View {
    let show: Bool
    var body: some View {
        Group {
            if show {
                VStack(spacing: 16) {
                                    // 系统自带的 SF Symbols 图标：对号
                                    Image(systemName: "checkmark")
                                        .font(.system(size: 40, weight: .semibold))
                                        .foregroundColor(.primary)
                                    
                                    Text("已复制")
                                        .font(.headline)
                                        .foregroundColor(.primary)
                                }
                                .frame(width: 140, height: 140)
                                // 核心：iOS 原生毛玻璃背景材质
                                .background(.ultraThinMaterial)
                                // 或者用更深的半透明黑底：.background(Color.black.opacity(0.75))
                                .cornerRadius(20)
                                // 微微的阴影增加立体感
                                .shadow(color: .black.opacity(0.1), radius: 10, x: 0, y: 5)
                                // 出现时的过渡动画：缩放+淡入淡出
                                .transition(.scale(scale: 0.8).combined(with: .opacity))
            }
        }
    }
}
