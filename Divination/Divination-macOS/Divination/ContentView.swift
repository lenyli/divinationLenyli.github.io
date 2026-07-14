import SwiftUI

let selectedColor = Color(red: 0.69, green: 0.77, blue: 0.87) // LightSteelBlue

func render(_ segs: [Seg], baseSize: CGFloat = 14) -> AttributedString {
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
    let action: () -> Void
    var body: some View {
        Button(action: action) {
            Text(title)
                .padding(.horizontal, 10).padding(.vertical, 5)
                .background(selected ? selectedColor : Color(NSColor.controlColor))
                .cornerRadius(5)
        }
        .buttonStyle(.plain)
    }
}

struct ContentView: View {
    @StateObject var eng = Engine()
    @State private var showHistory = false
    @State private var showHelp = false

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            // 模块行
            HStack(spacing: 6) {
                ForEach(0..<eng.mods.count, id: \.self) { i in
                    TabButton(title: eng.mods[i], selected: eng.curModule == i) { eng.switchModule(i) }
                }
            }
            // 子标签行
            if eng.curModule == 2 {
                HStack(spacing: 6) {
                    ForEach(0..<eng.tarotTabs.count, id: \.self) { i in
                        TabButton(title: eng.tarotTabs[i], selected: eng.curTab == i) { eng.switchTab(i) }
                    }
                    Toggle("包含特殊牌", isOn: $eng.includeSpecial)
                        .onChange(of: eng.includeSpecial) { _ in eng.resetTarotSessions() }
                }
            }
            if eng.curModule == 0 {
                HStack(spacing: 6) {
                    ForEach(0..<eng.homeTabs.count, id: \.self) { i in
                        TabButton(title: eng.homeTabs[i], selected: eng.curHomeTab == i) { eng.switchHomeTab(i) }
                    }
                    if eng.curHomeTab == 1 {
                        Text("未作校准，仅供参考，自行甄别").bold().foregroundColor(.red)
                    }
                }
            }
            // 输入
            HStack {
                Text("输入问题：")
                TextField("", text: $eng.question)
                    .textFieldStyle(.roundedBorder)
                    .onSubmit { eng.divine() }
            }
            // 按钮行
            HStack(spacing: 10) {
                Button(eng.goButtonText) { eng.divine() }.keyboardShortcut(.defaultAction)
                Button("复制结果") { eng.copyResult() }
                Button("清 空") { eng.clearPage() }
                Button("历史记录") { showHistory = true }
                Button("使用说明") { showHelp = true }
            }
            // 输出
            ScrollView {
                Text(render(eng.output))
                    .textSelection(.enabled)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(8)
            }
            .background(Color(NSColor.textBackgroundColor))
            .overlay(RoundedRectangle(cornerRadius: 4).stroke(Color.gray.opacity(0.4)))
        }
        .padding(14)
        .frame(minWidth: 700, minHeight: 540)
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
                ts.font = .system(size: 14).bold()
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
        VStack(alignment: .leading, spacing: 10) {
            Text("历史记录 - \(eng.mods[module])（最近30条）").font(.headline)
            ScrollView {
                Text(attributed)
                    .textSelection(.enabled)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(8)
            }
            .background(Color(NSColor.textBackgroundColor))
            .overlay(RoundedRectangle(cornerRadius: 4).stroke(Color.gray.opacity(0.4)))
            HStack {
                Button("复制全部") {
                    let h = eng.histories[module]
                    if !h.isEmpty { Engine.toClipboard(h.joined(separator: "\n\n")); eng.flashCopied() }
                }
                Button("清除全部") { eng.clearHistory(module: module) }
                Spacer()
                Button("关 闭") { dismiss() }.keyboardShortcut(.cancelAction)
            }
        }
        .padding(14)
        .frame(minWidth: 620, minHeight: 480)
        .overlay { CopiedToast(show: eng.showCopied) }
    }
}

struct CopiedToast: View {
    let show: Bool
    var body: some View {
        Group {
            if show {
                Text("已复制")
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(.white)
                    .padding(.horizontal, 22).padding(.vertical, 12)
                    .background(Color.black.opacity(0.75))
                    .cornerRadius(10)
                    .transition(.opacity)
            }
        }
    }
}
