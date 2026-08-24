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

struct ContentView: View {
    @StateObject var eng = Engine()
    @State private var showHistory = false
    @State private var showHelp = false
    @State private var showSpecialWarn = false

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Group {
                if eng.lang == .en {
                    // English: wrap after Lenormand (index 3) before Runes
                    HStack(alignment: .top, spacing: 4) {
                        VStack(spacing: 4) {
                            HStack(spacing: 4) {
                                ForEach(0..<4, id: \.self) { i in
                                    TabButton(title: eng.S.modTabs[i], selected: eng.curModule == i, expand: true, fontSize: 14) {
                                        eng.switchModule(i)
                                    }
                                }
                            }
                            HStack(spacing: 4) {
                                ForEach(4..<eng.S.modTabs.count, id: \.self) { i in
                                    TabButton(title: eng.S.modTabs[i], selected: eng.curModule == i, expand: true, fontSize: 14) {
                                        eng.switchModule(i)
                                    }
                                }
                            }
                        }
                        Button(eng.S.langBtn) { eng.toggleLang() }
                            .buttonStyle(.bordered)
                            .fixedSize()
                    }
                } else {
                    HStack(spacing: 4) {
                        ForEach(0..<eng.S.modTabs.count, id: \.self) { i in
                            TabButton(title: eng.S.modTabs[i], selected: eng.curModule == i, expand: true, fontSize: 15) {
                                eng.switchModule(i)
                            }
                        }
                        Button(eng.S.langBtn) { eng.toggleLang() }
                            .buttonStyle(.bordered)
                            .fixedSize()
                    }
                }
            }
            if eng.curModule == 2 {
                let specialToggle = Toggle(eng.S.includeSpecial, isOn: $eng.includeSpecial)
                    .fixedSize()
                    .onChange(of: eng.includeSpecial) { newVal in
                        eng.resetTarotSessions()
                        if newVal { showSpecialWarn = true }
                    }
                let tarotTabRow = ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 6) {
                        ForEach(0..<eng.tarotTabs.count, id: \.self) { i in
                            TabButton(title: eng.tarotTabs[i], selected: eng.curTab == i) { eng.switchTab(i) }
                        }
                        if eng.lang != .en { specialToggle }
                    }
                }
                if eng.lang == .en {
                    VStack(alignment: .leading, spacing: 6) {
                        tarotTabRow
                        specialToggle
                    }
                } else {
                    tarotTabRow
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
                        Text(eng.S.dateWarn).bold().foregroundColor(.red).font(.system(size: 13))
                    }
                }
            }
            if eng.curModule == 1 {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 5) {
                        Text(eng.S.upperTrigram).font(.system(size: 14))
                        Picker("", selection: $eng.liuYaoUpperTrigram) {
                            Text("").tag("")
                            ForEach(eng.liuYaoTrigramValues, id: \.self) { value in
                                Text(eng.liuYaoTrigramTitle(value)).tag(value)
                            }
                        }
                        .labelsHidden().pickerStyle(.menu).fixedSize()
                        Text(eng.S.lowerTrigram).font(.system(size: 14))
                        Picker("", selection: $eng.liuYaoLowerTrigram) {
                            Text("").tag("")
                            ForEach(eng.liuYaoTrigramValues, id: \.self) { value in
                                Text(eng.liuYaoTrigramTitle(value)).tag(value)
                            }
                        }
                        .labelsHidden().pickerStyle(.menu).fixedSize()
                        Text(eng.S.movingLines).font(.system(size: 14))
                        ForEach(POS.indices, id: \.self) { i in
                            TabButton(title: POS[i], selected: eng.liuYaoMovingLines.contains(i), fontSize: 13) {
                                eng.setLiuYaoMovingLine(i, selected: !eng.liuYaoMovingLines.contains(i))
                            }
                        }
                    }
                }
            }
            HStack {
                Text(eng.S.inputLabel).font(.system(size: 15))
                TextField("", text: $eng.question)
                    .textFieldStyle(.roundedBorder)
                    .onSubmit { eng.divine() }
            }
            HStack(spacing: 6) {
                Group {
                    Button(eng.goButtonText) { eng.divine() }.buttonStyle(.borderedProminent)
                    Button(eng.S.copy) { eng.copyResult() }.buttonStyle(.bordered)
                    Button(eng.S.clear) { eng.clearPage() }.buttonStyle(.bordered)
                    Button(eng.S.history) { showHistory = true }.buttonStyle(.bordered)
                    Button(eng.S.help) { showHelp = true }.buttonStyle(.bordered)
                }
                .lineLimit(1)
                .minimumScaleFactor(0.6)
                .frame(maxWidth: .infinity)
            }
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
        .overlay { CopiedToast(show: eng.showCopied, text: eng.S.copied) }
        .sheet(isPresented: $showHistory) {
            HistoryView(eng: eng, module: eng.curModule)
        }
        .alert(eng.S.helpTitle, isPresented: $showHelp) {
            Button(eng.S.ok, role: .cancel) {}
        } message: {
            Text(eng.helpText)
        }
        .alert(eng.S.specialWarnTitle, isPresented: $showSpecialWarn) {
            Button(eng.S.ok, role: .cancel) {}
        } message: {
            Text(eng.S.specialWarnText)
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
                    Button(eng.S.histCopyAll) {
                        let h = eng.histories[module]
                        if !h.isEmpty { Engine.toClipboard(h.joined(separator: "\n\n")); eng.flashCopied() }
                    }.buttonStyle(.bordered)
                    Button(eng.S.histClearAll) { eng.clearHistory(module: module) }.buttonStyle(.bordered)
                    Spacer()
                }
            }
            .padding(12)
            .navigationTitle(eng.S.histTitle(eng.mods[module]))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button(eng.S.close) { dismiss() }
                }
            }
        }
        .overlay { CopiedToast(show: eng.showCopied, text: eng.S.copied) }
    }
}

struct CopiedToast: View {
    let show: Bool
    let text: String
    var body: some View {
        Group {
            if show {
                VStack(spacing: 16) {
                    Image(systemName: "checkmark")
                        .font(.system(size: 40, weight: .semibold))
                        .foregroundColor(.primary)
                    Text(text)
                        .font(.headline)
                        .foregroundColor(.primary)
                }
                .frame(width: 140, height: 140)
                .background(.ultraThinMaterial)
                .cornerRadius(20)
                .shadow(color: .black.opacity(0.1), radius: 10, x: 0, y: 5)
                .transition(.scale(scale: 0.8).combined(with: .opacity))
            }
        }
    }
}
