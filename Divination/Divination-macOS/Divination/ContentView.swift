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
    @State private var showSpecialWarn = false

    private var newMethodTabs: [String] {
        eng.lang == .zh
            ? ["奇门遁甲", "大六壬", "小六壬", "梅花易数", "太乙神数", "金口诀"]
            : ["Qimen", "Da Liu Ren", "Xiao Liu Ren", "Meihua Yishu", "Taiyi", "Jin Kou Jue"]
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 6) {
                ForEach([0, 2, 3, 4, 5, 14, 6, 13], id: \.self) { i in
                    TabButton(title: eng.mods[i], selected: eng.curModule == i) { eng.switchModule(i) }
                }
                Spacer(minLength: 8)
                Button(eng.S.langBtn) { eng.toggleLang() }
            }
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 6) {
                    TabButton(title: eng.mods[1], selected: eng.curModule == 1) { eng.switchModule(1) }
                    ForEach(Array(newMethodTabs.enumerated()), id: \.offset) { i, title in
                        TabButton(title: title, selected: eng.curModule == 7 + i) {
                            eng.switchModule(7 + i)
                        }
                    }
                }
            }
            if eng.curModule == 2 {
                HStack(spacing: 6) {
                    ForEach(0..<eng.tarotTabs.count, id: \.self) { i in
                        TabButton(title: eng.tarotTabs[i], selected: eng.curTab == i) { eng.switchTab(i) }
                    }
                    Toggle(eng.S.includeSpecial, isOn: $eng.includeSpecial)
                        .onChange(of: eng.includeSpecial) { newVal in
                            eng.resetTarotSessions()
                            if newVal { showSpecialWarn = true }
                        }
                }
            }
            if eng.curModule == 1 {
                HStack(spacing: 6) {
                    Text(eng.S.upperTrigram)
                    Picker("", selection: $eng.liuYaoUpperTrigram) {
                        Text("").tag("")
                        ForEach(eng.liuYaoTrigramValues, id: \.self) { value in
                            Text(eng.liuYaoTrigramTitle(value)).tag(value)
                        }
                    }
                    .labelsHidden().pickerStyle(.menu).frame(width: 100)
                    Text(eng.S.lowerTrigram)
                    Picker("", selection: $eng.liuYaoLowerTrigram) {
                        Text("").tag("")
                        ForEach(eng.liuYaoTrigramValues, id: \.self) { value in
                            Text(eng.liuYaoTrigramTitle(value)).tag(value)
                        }
                    }
                    .labelsHidden().pickerStyle(.menu).frame(width: 100)
                    Text(eng.S.movingLines)
                    ForEach(POS.indices, id: \.self) { i in
                        TabButton(title: POS[i], selected: eng.liuYaoMovingLines.contains(i)) {
                            eng.setLiuYaoMovingLine(i, selected: !eng.liuYaoMovingLines.contains(i))
                        }
                    }
                }
            }
            if eng.focusEnabled { focusInputRow }
            if eng.curModule >= 7 && eng.curModule <= 13 {
                traditionalInputRow
            }
            HStack {
                Text(eng.S.inputLabel)
                TextField("", text: $eng.question)
                    .textFieldStyle(.roundedBorder)
                    .onSubmit { eng.divine() }
            }
            HStack(spacing: 10) {
                Button(eng.goButtonText) { eng.divine() }.keyboardShortcut(.defaultAction)
                Button(eng.S.copy) { eng.copyResult() }
                Button(eng.S.clear) { eng.clearPage() }
                Button(eng.S.history) { showHistory = true }
                Button(eng.S.help) { showHelp = true }
            }
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

    private var focusInputRow: some View {
        let isEn = eng.lang == .en
        return ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                Text(isEn ? "Question type" : "所测何事")
                Picker("", selection: $eng.questionCategory) {
                    ForEach(eng.questionCategories, id: \.self) { Text(eng.questionCategoryTitle($0)).tag($0) }
                }.labelsHidden().pickerStyle(.menu)
                Text(isEn ? "Gender" : "性别")
                Picker("", selection: $eng.questionGender) {
                    Text(isEn ? "None" : "不选").tag("")
                    Text(isEn ? "Male" : "男").tag("male")
                    Text(isEn ? "Female" : "女").tag("female")
                }.labelsHidden().pickerStyle(.menu)
                if eng.questionCategory == "search" {
                    Text(isEn ? "Target" : "寻找对象")
                    Picker("", selection: $eng.searchTarget) {
                        Text(isEn ? "Elder" : "长辈").tag("elder"); Text(isEn ? "Peer" : "平辈").tag("peer")
                        Text(isEn ? "Junior" : "晚辈").tag("junior"); Text(isEn ? "Property" : "财物").tag("property")
                    }.labelsHidden().pickerStyle(.menu)
                }
            }
        }
    }

    @ViewBuilder private var traditionalInputRow: some View {
        let isEn = eng.lang == .en
        let isAlmanac = eng.curModule == 13
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                if !isAlmanac {
                    Text(isEn ? "Cast time" : "起课时间")
                    DatePicker("", selection: $eng.traditionalDate)
                        .labelsHidden().datePickerStyle(.field)
                }
                if eng.curModule == 10 {
                    Text(isEn ? "Method" : "起卦方式")
                    Picker("", selection: $eng.traditionalMethod) {
                        Text(isEn ? "Time" : "时间").tag("time")
                        Text(isEn ? "Number" : "数字").tag("number")
                    }.labelsHidden().pickerStyle(.menu).frame(width: 95)
                    if eng.traditionalMethod == "number" {
                        Text(isEn ? "Number" : "数字")
                        TextField("", value: $eng.traditionalNumber, format: .number).frame(width: 80)
                    }
                } else if eng.curModule == 11 {
                    Text(isEn ? "Scope" : "计式")
                    Picker("", selection: $eng.traditionalScope) {
                        Text("年计").tag("year"); Text("月计").tag("month")
                        Text("日计").tag("day"); Text("时计").tag("hour")
                    }.labelsHidden().pickerStyle(.menu).frame(width: 85)
                } else if eng.curModule == 12 {
                    Text(isEn ? "Earth branch" : "地分方式")
                    Picker("", selection: $eng.traditionalMethod) {
                        Text(isEn ? "Time" : "时间").tag("time")
                        Text(isEn ? "Branch" : "指定地分").tag("branch")
                        Text(isEn ? "Number" : "数字").tag("number")
                    }.labelsHidden().pickerStyle(.menu).frame(width: 110)
                    if eng.traditionalMethod == "branch" {
                        Picker("", selection: $eng.traditionalBranch) {
                            ForEach("子丑寅卯辰巳午未申酉戌亥".map(String.init), id: \.self) { Text($0).tag($0) }
                        }.labelsHidden().pickerStyle(.menu).frame(width: 65)
                    } else if eng.traditionalMethod == "number" {
                        TextField("", value: $eng.traditionalNumber, format: .number).frame(width: 80)
                    }
                } else if isAlmanac {
                    Text(isEn ? "Topic" : "事项")
                    Picker("", selection: $eng.almanacTopic) {
                        Text("婚嫁").tag("marriage"); Text("搬迁").tag("move")
                        Text("开业").tag("opening"); Text("签约").tag("contract")
                        Text("出行").tag("travel"); Text("求医").tag("medical")
                        Text("求学").tag("study"); Text("安葬").tag("burial")
                        Text("动土").tag("renovation"); Text("通用").tag("custom")
                    }.labelsHidden().pickerStyle(.menu).frame(width: 85)
                    Text(isEn ? "Start" : "开始")
                    DatePicker("", selection: $eng.almanacStartDate, displayedComponents: .date)
                        .labelsHidden().datePickerStyle(.field)
                    Text(isEn ? "End" : "结束")
                    DatePicker("", selection: $eng.almanacEndDate, displayedComponents: .date)
                        .labelsHidden().datePickerStyle(.field)
                }
            }
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
            Text(eng.S.histTitleLong(eng.mods[module])).font(.headline)
            ScrollView {
                Text(attributed)
                    .textSelection(.enabled)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(8)
            }
            .background(Color(NSColor.textBackgroundColor))
            .overlay(RoundedRectangle(cornerRadius: 4).stroke(Color.gray.opacity(0.4)))
            HStack {
                Button(eng.S.histCopyAll) {
                    let h = eng.histories[module]
                    if !h.isEmpty { Engine.toClipboard(h.joined(separator: "\n\n")); eng.flashCopied() }
                }
                Button(eng.S.histClearAll) { eng.clearHistory(module: module) }
                Spacer()
                Button(eng.S.close) { dismiss() }.keyboardShortcut(.cancelAction)
            }
        }
        .padding(14)
        .frame(minWidth: 620, minHeight: 480)
        .overlay { CopiedToast(show: eng.showCopied, text: eng.S.copied) }
    }
}

struct CopiedToast: View {
    let show: Bool
    let text: String
    var body: some View {
        Group {
            if show {
                Text(text)
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
