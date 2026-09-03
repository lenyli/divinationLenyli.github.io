import SwiftUI
import UIKit

let selectedColor = Color(red: 0.69, green: 0.77, blue: 0.87) // LightSteelBlue

struct SelectableResultText: UIViewRepresentable {
    let segments: [Seg]
    var baseSize: CGFloat = 15

    private final class ResultTextView: UITextView {
        private var bodyAttributedText: NSAttributedString?

        func applyBodyAttributedText(_ value: NSAttributedString, force: Bool = false) {
            bodyAttributedText = value
            guard force || !attributedText.isEqual(to: value) else { return }

            let preservedSelectedRange = selectedRange
            let preservedContentOffset = contentOffset
            attributedText = value
            if preservedSelectedRange.location != NSNotFound,
               NSMaxRange(preservedSelectedRange) <= value.length {
                selectedRange = preservedSelectedRange
            }
            setContentOffset(preservedContentOffset, animated: false)
        }

        override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
            super.traitCollectionDidChange(previousTraitCollection)
            guard let previousTraitCollection,
                  previousTraitCollection.hasDifferentColorAppearance(comparedTo: traitCollection),
                  let bodyAttributedText else { return }
            applyBodyAttributedText(bodyAttributedText, force: true)
        }
    }

    private var bodyAttributedText: NSAttributedString {
        let result = NSMutableAttributedString()
        for segment in segments {
            let size = baseSize + (segment.big ? 2 : 0)
            let baseFont = UIFont.systemFont(ofSize: size)
            var traits: UIFontDescriptor.SymbolicTraits = []
            if segment.bold { traits.insert(.traitBold) }
            if segment.italic { traits.insert(.traitItalic) }
            let font = baseFont.fontDescriptor.withSymbolicTraits(traits).map {
                UIFont(descriptor: $0, size: size)
            } ?? baseFont
            result.append(NSAttributedString(
                string: segment.text,
                attributes: [
                    .font: font,
                    .foregroundColor: segment.red ? UIColor.systemRed : UIColor.label,
                ]
            ))
        }
        return result
    }

    func makeUIView(context: Context) -> UITextView {
        let view = ResultTextView()
        view.isEditable = false
        view.isSelectable = true
        view.isScrollEnabled = true
        view.alwaysBounceVertical = true
        view.backgroundColor = .clear
        view.textColor = .label
        view.textContainerInset = UIEdgeInsets(top: 8, left: 8, bottom: 8, right: 8)
        view.textContainer.lineFragmentPadding = 0
        view.accessibilityIdentifier = "resultTextView"
        return view
    }

    func updateUIView(_ view: UITextView, context: Context) {
        (view as? ResultTextView)?.applyBodyAttributedText(bodyAttributedText)
    }
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
    @State private var showSpecialUnlock = false
    @State private var specialCode = ""
    @State private var specialCodeError = ""
    private let mobileTabLayout: [Int?] = [
        0, 13, 14, -1,
        2, 3, 4, 5,
        1, 7, 8, 9,
        10, 11, 12, 6,
    ]

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            LazyVGrid(
                columns: Array(repeating: GridItem(.flexible(), spacing: 6), count: 4),
                spacing: 6
            ) {
                ForEach(Array(mobileTabLayout.enumerated()), id: \.offset) { entry in
                    if let index = entry.element {
                        if index == -1 {
                            TabButton(title: eng.S.langBtn, selected: false, expand: true, fontSize: 12) {
                                eng.toggleLang()
                            }
                        } else {
                            TabButton(title: eng.S.modTabs[index], selected: eng.curModule == index, expand: true, fontSize: 12) {
                                eng.switchModule(index)
                            }
                        }
                    } else {
                        Color.clear.frame(maxWidth: .infinity, minHeight: 30)
                    }
                }
            }
            if eng.curModule == 2 {
                let specialToggle = Toggle(eng.S.includeSpecial, isOn: specialDeckBinding)
                    .fixedSize()
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
            if eng.curModule == 1 {
                VStack(alignment: .leading, spacing: 6) {
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
                        }
                    }
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 5) {
                            Text(eng.S.movingLines).font(.system(size: 14))
                            ForEach(POS.indices, id: \.self) { i in
                                TabButton(title: POS[i], selected: eng.liuYaoMovingLines.contains(i), fontSize: 13) {
                                    eng.setLiuYaoMovingLine(i, selected: !eng.liuYaoMovingLines.contains(i))
                                }
                            }
                        }
                    }
                }
            }
            if eng.focusEnabled { focusInputRow }
            if eng.curModule >= 7 && eng.curModule <= 13 {
                traditionalInputRow
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
            SelectableResultText(segments: eng.output)
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
            .background(Color(UIColor.systemBackground))
            .overlay(RoundedRectangle(cornerRadius: 6).stroke(Color.gray.opacity(0.4)))
        }
        .padding(12)
        .overlay { CopiedToast(show: eng.showCopied, text: eng.S.copied) }
        .sheet(isPresented: $showHistory) {
            HistoryView(eng: eng, module: eng.curModule)
        }
        .sheet(isPresented: $showSpecialUnlock) {
            specialUnlockView
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

    private var specialDeckBinding: Binding<Bool> {
        Binding(
            get: { eng.includeSpecial },
            set: { enabled in
                guard !eng.requestSpecialDeckChange(enabled) else { return }
                specialCode = ""
                specialCodeError = ""
                showSpecialUnlock = true
            }
        )
    }

    private var specialUnlockView: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 16) {
                Text(eng.lang == .en ? "Enter the verification code to enable the special deck." : "请输入验证码以启用特殊牌组。")
                SecureField(eng.lang == .en ? "Verification code" : "验证码", text: $specialCode)
                    .textFieldStyle(.roundedBorder)
                if !specialCodeError.isEmpty {
                    Text(specialCodeError).foregroundColor(.red)
                }
                Spacer()
                HStack {
                    Button(eng.lang == .en ? "Cancel" : "取消", role: .cancel) {
                        showSpecialUnlock = false
                    }
                    Spacer()
                    Button(eng.lang == .en ? "Verify" : "验证") {
                        if eng.unlockSpecialDeck(code: specialCode) {
                            showSpecialUnlock = false
                            showSpecialWarn = true
                        } else {
                            specialCodeError = eng.lang == .en ? "Incorrect verification code" : "验证码不正确"
                        }
                    }
                    .buttonStyle(.borderedProminent)
                }
            }
            .padding(20)
            .navigationTitle(eng.lang == .en ? "Special deck verification" : "特殊牌组验证")
        }
        .presentationDetents([.medium])
        .interactiveDismissDisabled()
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
        if isAlmanac {
            VStack(alignment: .leading, spacing: 8) {
                HStack(spacing: 8) {
                    Text(isEn ? "Topic" : "事项")
                    Picker("", selection: $eng.almanacTopic) {
                        Text("婚嫁").tag("marriage"); Text("搬迁").tag("move")
                        Text("开业").tag("opening"); Text("签约").tag("contract")
                        Text("出行").tag("travel"); Text("求医").tag("medical")
                        Text("求学").tag("study"); Text("安葬").tag("burial")
                        Text("动土").tag("renovation"); Text("通用").tag("custom")
                    }.labelsHidden().pickerStyle(.menu)
                }
                HStack(spacing: 8) {
                    Text(isEn ? "Start" : "开始")
                    DatePicker("", selection: $eng.almanacStartDate, displayedComponents: .date)
                        .labelsHidden().datePickerStyle(.compact)
                    Text(isEn ? "End" : "结束")
                    DatePicker("", selection: $eng.almanacEndDate, displayedComponents: .date)
                        .labelsHidden().datePickerStyle(.compact)
                }
            }
        } else {
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    Text(isEn ? "Cast time" : "起课时间").font(.system(size: 14))
                    DatePicker("", selection: $eng.traditionalDate)
                        .labelsHidden().datePickerStyle(.compact)
                    if eng.curModule == 10 {
                        Text(isEn ? "Method" : "起卦方式")
                        Picker("", selection: $eng.traditionalMethod) {
                            Text(isEn ? "Time" : "时间").tag("time")
                            Text(isEn ? "Number" : "数字").tag("number")
                        }.labelsHidden().pickerStyle(.menu)
                        if eng.traditionalMethod == "number" {
                            Text(isEn ? "Number" : "数字")
                            TextField("", value: $eng.traditionalNumber, format: .number)
                                .textFieldStyle(.roundedBorder).frame(width: 90)
                        }
                    } else if eng.curModule == 11 {
                        Text(isEn ? "Scope" : "计式")
                        Picker("", selection: $eng.traditionalScope) {
                            Text("年计").tag("year"); Text("月计").tag("month")
                            Text("日计").tag("day"); Text("时计").tag("hour")
                        }.labelsHidden().pickerStyle(.menu)
                    } else if eng.curModule == 12 {
                        Text(isEn ? "Earth branch" : "地分方式")
                        Picker("", selection: $eng.traditionalMethod) {
                            Text(isEn ? "Time" : "时间").tag("time")
                            Text(isEn ? "Branch" : "指定地分").tag("branch")
                            Text(isEn ? "Number" : "数字").tag("number")
                        }.labelsHidden().pickerStyle(.menu)
                        if eng.traditionalMethod == "branch" {
                            Picker("", selection: $eng.traditionalBranch) {
                                ForEach("子丑寅卯辰巳午未申酉戌亥".map(String.init), id: \.self) { Text($0).tag($0) }
                            }.labelsHidden().pickerStyle(.menu)
                        } else if eng.traditionalMethod == "number" {
                            TextField("", value: $eng.traditionalNumber, format: .number)
                                .textFieldStyle(.roundedBorder).frame(width: 90)
                        }
                    }
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
