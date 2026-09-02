// 占卜逻辑引擎：完整移植自 Divination.cs
import Foundation
import SwiftUI
import AppKit

struct Seg {
    var text: String
    var bold = false
    var italic = false
    var red = false
    var big = false
}

final class Engine: ObservableObject {
    @Published var question = ""
    @Published var output: [Seg] = []
    @Published var curModule = 0   // 0首页 1六爻 2塔罗 3雷诺曼 4卢恩符文 5占星骰子 6灵签
    @Published var curTab = 0      // 塔罗：0通用 1YESNO 2大牌
    @Published var curHomeTab = 0  // 首页：0综合 1日期
    @Published var includeSpecial = false
    @Published var histories: [[String]] = Array(repeating: [], count: 15)
    @Published var lang: AppLang = AppLang.detect()
    @Published var showCopied = false
    @Published var liuYaoUpperTrigram = ""
    @Published var liuYaoLowerTrigram = ""
    @Published var liuYaoMovingLines: Set<Int> = []
    @Published var traditionalDate = Date()
    @Published var traditionalMethod = "time"
    @Published var traditionalNumber = 1
    @Published var traditionalBranch = "子"
    @Published var traditionalScope = "year"
    @Published var questionCategory = ""
    @Published var questionGender = ""
    @Published var searchTarget = "elder"
    @Published var almanacTopic = "marriage"
    @Published var almanacStartDate = Date()
    @Published var almanacEndDate = Calendar.current.date(byAdding: .day, value: 30, to: Date()) ?? Date()

    var copyText = ""
    var drawnGen: [Int] = []
    var drawnMajor: [Int] = []
    var sessGen = -1, sessMaj = -1
    var pageSegs: [[Seg]?] = Array(repeating: nil, count: 18)
    var pageCopy: [String?] = Array(repeating: nil, count: 18)
    let SPECIAL_TAROT_START = 156
    let LENORMAND_SPECIAL_START = 43
    let ORACLE_SPECIAL_START = 49

    var S: L10n { L10n.of(lang) }
    var mods: [String] { S.mods }
    var tarotTabs: [String] { S.tarotTabs }
    var homeTabs: [String] { S.homeTabs }
    var helpText: String { S.helpText }
    let liuYaoTrigramValues = ["天", "泽", "火", "雷", "风", "水", "山", "地"]
    let traditionalMethods = ["qimen", "liuren", "xiaoliuren", "meihua", "taiyi", "jinkoujue", "almanac"]
    let questionCategories = ["", "loveSingle", "lovePartner", "marriage", "wealth", "career", "litigation", "health", "study", "travel", "search"]

    func questionCategoryTitle(_ value: String) -> String {
        if value.isEmpty { return lang == .en ? "None" : "不选" }
        let zh = ["loveSingle": "婚恋·未婚", "lovePartner": "婚恋·已有对象", "marriage": "婚姻·已婚", "wealth": "财运", "career": "事业", "litigation": "官司诉讼", "health": "健康疾病", "study": "考试／学业", "travel": "出行／远行", "search": "寻人寻物"]
        let en = ["loveSingle": "Love · single", "lovePartner": "Love · partnered", "marriage": "Marriage", "wealth": "Wealth", "career": "Career", "litigation": "Litigation", "health": "Health", "study": "Study / exam", "travel": "Travel", "search": "Find person / item"]
        return (lang == .en ? en : zh)[value] ?? value
    }

    var focusEnabled: Bool { curModule != 13 }

    private var focusDescription: String {
        var details: [String] = []
        if questionGender == "male" { details.append("男测") }
        if questionGender == "female" { details.append("女测") }
        if questionCategory == "search" { details.append("寻" + ["elder":"长辈", "peer":"平辈", "junior":"晚辈", "property":"财物"][searchTarget]!) }
        let title = questionCategory.isEmpty ? "" : questionCategoryTitle(questionCategory)
        if title.isEmpty { return details.joined(separator: "·") }
        return title + (details.isEmpty ? "" : "（" + details.joined(separator: "·") + "）")
    }

    private func focusOptions() -> [String: Any] {
        guard focusEnabled, !questionCategory.isEmpty else { return [:] }
        if ["loveSingle", "lovePartner", "marriage"].contains(questionCategory), questionGender.isEmpty { return [:] }
        var options: [String: Any] = ["questionCategory": questionCategory]
        if ["loveSingle", "lovePartner", "marriage"].contains(questionCategory) { options["gender"] = questionGender }
        if questionCategory == "search" { options["searchTarget"] = searchTarget }
        return options
    }

    private func withFocusContext(_ text: String) -> String {
        let description = focusDescription
        guard focusEnabled, !description.isEmpty else { return text }
        let label = S.isEn ? "Question type / gender: " : "所测何事／性别："
        return label + description + "\n" + text
    }

    private func copyHeader(_ q: String) -> String {
        var lines = [(S.isEn ? "Question: " : "问题：") + q]
        let description = focusDescription
        if focusEnabled, !description.isEmpty {
            lines.append((S.isEn ? "Question type / gender: " : "所测何事／性别：") + description)
        }
        return lines.joined(separator: "\n")
    }

    private func copyBlock(_ q: String, title: String, body: String) -> String {
        let context = [focusEnabled ? focusDescription : "", title].filter { !$0.isEmpty }
        let prefix = context.isEmpty ? "" : "（" + context.joined(separator: "／") + "）"
        return "【" + prefix + q + "：" + body + "】"
    }

    private func traditionalCopyBlock(_ q: String, fallbackTitle: String, display: String) -> String {
        var lines = display.components(separatedBy: "\n")
        var title = fallbackTitle
        if let first = lines.first, first.hasPrefix("【"), first.hasSuffix("】") {
            title = String(first.dropFirst().dropLast())
            lines.removeFirst()
        }
        return copyBlock(q, title: title, body: lines.joined(separator: "\n"))
    }

    func liuYaoTrigramTitle(_ value: String) -> String {
        ["天": "乾（天）", "泽": "兑（泽）", "火": "离（火）", "雷": "震（雷）",
         "风": "巽（风）", "水": "坎（水）", "山": "艮（山）", "地": "坤（地）"][value] ?? value
    }

    func setLiuYaoMovingLine(_ index: Int, selected: Bool) {
        if selected { liuYaoMovingLines.insert(index) }
        else { liuYaoMovingLines.remove(index) }
    }

    init() { loadHistories() }

    func toggleLang() {
        lang = (lang == .zh) ? .en : .zh
        UserDefaults.standard.set(lang.rawValue, forKey: "divination_lang")
    }

    var goButtonText: String {
        switch curModule {
        case 0: return S.goHome
        case 1: return S.goLiuYao
        case 5: return S.goDice
        case 6: return S.goQian
        case 7...13: return S.isEn ? "Calculate" : "排 盘"
        default: return S.goDraw
        }
    }

    private func qianTable() -> [[String]] { lang == .en ? QIAN_EN : QIAN }

    private func pickQian() -> [String] {
        let i = Int.random(in: 0..<QIAN.count)
        return qianTable()[i]
    }

    // ================= 输出辅助 =================
    private func ap(_ t: String, bold: Bool = false, italic: Bool = false) {
        output.append(Seg(text: t, bold: bold, italic: italic))
    }
    private func apC(_ t: String) {
        output.append(Seg(text: t, bold: true, red: true, big: true))
    }

    // ================= 页面状态 =================
    func pageIndex() -> Int {
        if curModule == 0 { return curHomeTab }
        if curModule == 1 { return 2 }
        if curModule == 2 { return 3 + curTab }
        if curModule <= 6 { return 6 + (curModule - 3) }
        if curModule == 14 { return 17 }
        return 10 + (curModule - 7)
    }
    func saveState() {
        let p = pageIndex()
        pageSegs[p] = output
        pageCopy[p] = copyText
    }
    func restoreState() {
        let p = pageIndex()
        if let s = pageSegs[p] { output = s; copyText = pageCopy[p] ?? "" }
        else { output = []; copyText = "" }
    }
    func switchModule(_ i: Int) {
        saveState(); curModule = i
        if i == 10 && !["time", "number"].contains(traditionalMethod) { traditionalMethod = "time" }
        restoreState()
    }
    func switchTab(_ t: Int) { saveState(); curTab = t; restoreState() }
    func switchHomeTab(_ t: Int) { saveState(); curHomeTab = t; restoreState() }

    func resetTarotSessions() {
        drawnGen.removeAll()
        sessGen = -1
        pageSegs[3] = nil
        pageCopy[3] = nil
        if curModule == 2 && curTab == 0 { restoreState() }
    }

    // ================= 入口 =================
    func divine() {
        if focusEnabled,
           ["loveSingle", "lovePartner", "marriage"].contains(questionCategory),
           questionGender.isEmpty {
            copyText = ""
            output = [Seg(text: S.isEn ? "Please select a gender for love or marriage questions." : "婚恋／婚姻类必须选择性别。", red: true)]
            return
        }
        if curModule == 1 {
            let hasManual = !liuYaoUpperTrigram.isEmpty || !liuYaoLowerTrigram.isEmpty || !liuYaoMovingLines.isEmpty
            if hasManual && (liuYaoUpperTrigram.isEmpty || liuYaoLowerTrigram.isEmpty) {
                copyText = ""
                output = [Seg(text: S.completeTrigrams, red: true)]
                return
            }
        }
        var q = question.trimmingCharacters(in: .whitespaces)
        if q.isEmpty { q = S.emptyQuestion }
        doDivine(q)
        saveState()
    }

    private func doDivine(_ q: String) {
        if curModule == 0 { divineHome(q); return }
        if curModule == 6 { divineQian(q); return }
        if curModule == 2 { divineTarot(q); return }
        if curModule == 13 { divineDate(q); return }
        if curModule == 14 { divineOracle(q); return }
        if curModule >= 7 && curModule <= 13 { divineTraditional(q); return }
        var lines: [[String]] = []
        let result: String
        if curModule == 1 {
            let useSelection = !liuYaoUpperTrigram.isEmpty && !liuYaoLowerTrigram.isEmpty
            result = divineLiuYao(&lines, useSelection: useSelection)
        }
        else if curModule == 3 { result = divineLenormand(&lines) }
        else if curModule == 4 { result = divineRunes(&lines) }
        else { result = divineAstro(&lines) }
        copyText = copyBlock(q, title: S.mods[curModule], body: result)
        output = []
        addHistory()
        ap(copyText + "\n\n" + S.briefNote + "\n")
        for (i, ln) in lines.enumerated() {
            ap(ln[0])
            ap(ln[1], bold: true)
            ap("：" + ln[2] + "。")
            if !ln[3].isEmpty { ap(ln[3], italic: true) }
            if i < lines.count - 1 { ap("\n") }
        }
    }

    private func divineTraditional(_ q: String) {
        let method = traditionalMethods[curModule - 7]
        var options: [String: Any] = [:]
        var date = traditionalDate
        if method == "meihua" {
            options = ["method": traditionalMethod, "number": traditionalNumber]
        } else if method == "taiyi" {
            options = ["scope": traditionalScope]
        } else if method == "jinkoujue" {
            options = ["method": traditionalMethod, "branch": traditionalBranch, "number": traditionalNumber]
        } else if method == "almanac" {
            let formatter = DateFormatter()
            formatter.locale = Locale(identifier: "en_US_POSIX")
            formatter.dateFormat = "yyyy-MM-dd"
            options = ["topic": almanacTopic,
                       "startDate": formatter.string(from: almanacStartDate),
                       "endDate": formatter.string(from: almanacEndDate)]
            date = almanacStartDate
        }
        if method != "qimen" && method != "almanac" {
            options.merge(focusOptions()) { current, _ in current }
        }
        do {
            let result = try TraditionalAlgorithmEngine.shared.calculate(method: method, date: date, options: options)
            copyText = traditionalCopyBlock(q, fallbackTitle: S.mods[curModule], display: result.display)
            output = [Seg(text: copyText)]
            addHistory()
        } catch {
            copyText = ""
            output = [Seg(text: error.localizedDescription, red: true)]
        }
    }

    func copyResult() {
        if !copyText.isEmpty { Self.toClipboard(copyText); flashCopied() }
    }

    func flashCopied() {
        withAnimation { showCopied = true }
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) {
            withAnimation { self.showCopied = false }
        }
    }
    func clearPage() {
        question = ""; output = []; copyText = ""
        questionCategory = ""; questionGender = ""
        if curModule == 1 {
            liuYaoUpperTrigram = ""
            liuYaoLowerTrigram = ""
            liuYaoMovingLines.removeAll()
        }
        drawnGen.removeAll(); drawnMajor.removeAll()
        sessGen = -1; sessMaj = -1
        let p = pageIndex()
        pageSegs[p] = nil; pageCopy[p] = nil
    }
    static func toClipboard(_ s: String) {
        NSPasteboard.general.clearContents()
        NSPasteboard.general.setString(s, forType: .string)
    }

    // ================= 六爻 =================
    private func lineOfToss(_ heads: Int) -> (ben: String, zhi: String, cuo: String) {
        switch heads {
        case 3: return ("阳○", "阴", "阴")
        case 2: return ("阳", "阳", "阴")
        case 1: return ("阴", "阴", "阳")
        default: return ("阴○", "阳", "阳")
        }
    }
    private func elem(_ a: String, _ b: String, _ c: String) -> String {
        TRI_ELEM[(a + b + c).replacingOccurrences(of: "○", with: "")]!
    }
    private func hexg(_ up: String, _ low: String) -> [String] { HEXAGRAMS[up + low]! }

    private func flipLine(_ line: String) -> String { line == "阳" ? "阴" : "阳" }

    private func liuYaoSixRelation(_ selfElement: String, _ otherElement: String) -> String {
        let cycle = ["木", "火", "土", "金", "水"]
        if selfElement == otherElement { return "兄弟" }
        let a = cycle.firstIndex(of: selfElement)!, b = cycle.firstIndex(of: otherElement)!
        if (a + 1) % 5 == b { return "子孙" }
        if (b + 1) % 5 == a { return "父母" }
        if (a + 2) % 5 == b { return "妻财" }
        return "官鬼"
    }

    private func liuYaoElementRelation(_ from: String, _ to: String) -> String {
        let cycle = ["木", "火", "土", "金", "水"]
        if from == to { return "比和" }
        let a = cycle.firstIndex(of: from)!, b = cycle.firstIndex(of: to)!
        if (a + 1) % 5 == b { return from + "生" + to }
        if (a + 2) % 5 == b { return from + "克" + to }
        if (b + 1) % 5 == a { return to + "生" + from }
        return to + "克" + from
    }

    private func liuYaoFocusSummary(ben: [String], upper: String, lower: String) -> String {
        guard curModule == 1 || (curModule == 0 && curHomeTab == 0) else { return "" }
        let categories = ["loveSingle": "婚恋·未婚", "lovePartner": "婚恋·已有对象", "marriage": "婚姻·已婚", "wealth": "财运", "career": "事业", "litigation": "官司诉讼", "health": "健康疾病", "study": "考试／学业", "travel": "出行／远行", "search": "寻人寻物"]
        guard !questionCategory.isEmpty else { return "" }
        let category = categories[questionCategory] ?? questionCategory
        if questionCategory == "travel" { return "事项定位\(category)，用神六亲世爻本身，用神爻位\(ben[1])爻，是否伏神否；" }
        let palaces: [String: [String]] = [
            "乾": ["乾为天","天风姤","天山遁","天地否","风地观","山地剥","火地晋","火天大有"],
            "兑": ["兑为泽","泽水困","泽地萃","泽山咸","水山蹇","地山谦","雷山小过","雷泽归妹"],
            "离": ["离为火","火山旅","火风鼎","火水未济","山水蒙","风水涣","天水讼","天火同人"],
            "震": ["震为雷","雷地豫","雷水解","雷风恒","地风升","水风井","泽风大过","泽雷随"],
            "巽": ["巽为风","风天小畜","风火家人","风雷益","天雷无妄","火雷噬嗑","山雷颐","山风蛊"],
            "坎": ["坎为水","水泽节","水雷屯","水火既济","泽火革","雷火丰","地火明夷","地水师"],
            "艮": ["艮为山","山火贲","山天大畜","山泽损","火泽睽","天泽履","风泽中孚","风山渐"],
            "坤": ["坤为地","地雷复","地泽临","地天泰","雷天大壮","泽天夬","水天需","水地比"]
        ]
        guard let palace = palaces.first(where: { $0.value.contains(ben[0]) })?.key else { return "" }
        let palaceInfo = ["乾": ("金","天"), "兑": ("金","泽"), "离": ("火","火"), "震": ("木","雷"), "巽": ("木","风"), "坎": ("水","水"), "艮": ("土","山"), "坤": ("土","地")]
        let najia: [String: [[String]]] = [
            "天": [["子","寅","辰"],["午","申","戌"]], "泽": [["巳","卯","丑"],["亥","酉","未"]],
            "火": [["卯","丑","亥"],["酉","未","巳"]], "雷": [["子","寅","辰"],["午","申","戌"]],
            "风": [["丑","亥","酉"],["未","巳","卯"]], "水": [["寅","辰","午"],["申","戌","子"]],
            "山": [["辰","午","申"],["戌","子","寅"]], "地": [["未","巳","卯"],["丑","亥","酉"]]
        ]
        let branchElements = ["子":"水","丑":"土","寅":"木","卯":"木","辰":"土","巳":"火","午":"火","未":"土","申":"金","酉":"金","戌":"土","亥":"水"]
        let (palaceElement, pureTrigram) = palaceInfo[palace]!
        let branches = najia[lower]![0] + najia[upper]![1]
        let requested: String = {
            if ["loveSingle", "lovePartner", "marriage"].contains(questionCategory) { return questionGender == "male" ? "妻财" : "官鬼" }
            if questionCategory == "wealth" { return "妻财" }
            if ["career", "litigation", "health"].contains(questionCategory) { return "官鬼" }
            if questionCategory == "study" { return "父母" }
            return ["elder":"父母", "peer":"兄弟", "junior":"子孙", "property":"妻财"][searchTarget]!
        }()
        let positions = branches.indices.filter { liuYaoSixRelation(palaceElement, branchElements[branches[$0]]!) == requested }.map { POS[$0] + "爻" }
        if !positions.isEmpty { return "事项定位\(category)，用神六亲\(requested)，用神爻位\(positions.joined(separator: "、"))，是否伏神否；" }
        let hiddenBranches = najia[pureTrigram]![0] + najia[pureTrigram]![1]
        let details = hiddenBranches.indices.compactMap { index -> String? in
            let hiddenElement = branchElements[hiddenBranches[index]]!
            guard liuYaoSixRelation(palaceElement, hiddenElement) == requested else { return nil }
            let flyingElement = branchElements[branches[index]]!, relation = liuYaoElementRelation(flyingElement, hiddenElement)
            let note = relation == flyingElement + "生" + hiddenElement ? "出现有助" : relation == flyingElement + "克" + hiddenElement ? "出现受制" : "需结合旺衰"
            return "\(POS[index])爻伏神\(hiddenBranches[index])\(requested)，飞神\(branches[index])\(liuYaoSixRelation(palaceElement, flyingElement))，\(relation)（\(note)）"
        }
        return "事项定位\(category)，用神六亲\(requested)，用神爻位伏藏，是否伏神是，伏神信息\(details.joined(separator: "；"))；"
    }

    private func selectedLiuYaoLines() -> (h: [String], z: [String], c: [String]) {
        let patterns: [String: [String]] = [
            "天": ["阳", "阳", "阳"], "泽": ["阴", "阳", "阳"],
            "火": ["阳", "阴", "阳"], "雷": ["阴", "阴", "阳"],
            "风": ["阳", "阳", "阴"], "水": ["阴", "阳", "阴"],
            "山": ["阳", "阴", "阴"], "地": ["阴", "阴", "阴"]
        ]
        let up = patterns[liuYaoUpperTrigram]!, low = patterns[liuYaoLowerTrigram]!
        var h = [String](repeating: "", count: 6)
        var z = h, c = h
        h[5] = up[0]; h[4] = up[1]; h[3] = up[2]
        h[2] = low[0]; h[1] = low[1]; h[0] = low[2]
        for i in 0..<6 {
            let baseLine = h[i]
            let moving = liuYaoMovingLines.contains(i)
            z[i] = moving ? flipLine(baseLine) : baseLine
            c[i] = flipLine(baseLine)
            if moving { h[i] += "○" }
        }
        return (h, z, c)
    }

    private func divineLiuYao(_ lines: inout [[String]], useSelection: Bool = false) -> String {
        var h = [String](repeating: "", count: 6)
        var z = h, c = h
        if useSelection {
            let selected = selectedLiuYaoLines()
            h = selected.h; z = selected.z; c = selected.c
        } else {
            for i in 0..<6 {
                var heads = 0
                for _ in 0..<3 where Int.random(in: 0..<2) == 0 { heads += 1 }
                let t = lineOfToss(heads)
                h[i] = t.ben; z[i] = t.zhi; c[i] = t.cuo
            }
        }
        let upper = elem(h[5], h[4], h[3]), lower = elem(h[2], h[1], h[0])
        let ben  = hexg(upper, lower)
        let bian = hexg(elem(z[5], z[4], z[3]), elem(z[2], z[1], z[0]))
        let hu   = hexg(elem(h[4], h[3], h[2]), elem(h[3], h[2], h[1]))
        let cuog = hexg(elem(c[5], c[4], c[3]), elem(c[2], c[1], c[0]))
        let zong = hexg(elem(h[0], h[1], h[2]), elem(h[3], h[4], h[5]))
        var dong: [String] = []
        for i in 0..<6 where h[i].contains("○") { dong.append(POS[i]) }
        let rows = S.liuYaoRows
        lines.append([rows[0][0], ben[0],  ben[3],  rows[0][1]])
        lines.append([rows[1][0], bian[0], bian[3], rows[1][1]])
        lines.append([rows[2][0], hu[0],   hu[3],   rows[2][1]])
        lines.append([rows[3][0], cuog[0], cuog[3], rows[3][1]])
        lines.append([rows[4][0], zong[0], zong[3], rows[4][1]])
        return S.liuYaoSummary(ben: ben, dong: dong, bian: bian, hu: hu, cuo: cuog, zong: zong) + liuYaoFocusSummary(ben: ben, upper: upper, lower: lower)
    }

    // ================= 占星骰子 =================
    private func cjk(_ s: String) -> String {
        var start: String.Index? = nil
        for i in s.indices {
            let isCjk = s[i].unicodeScalars.first.map { $0.value >= 0x4E00 && $0.value <= 0x9FA5 } ?? false
            if isCjk && start == nil { start = i }
            if !isCjk, let st = start { return String(s[st..<i]) }
        }
        if let st = start { return String(s[st...]) }
        return s
    }
    private func divineAstro(_ lines: inout [[String]]) -> String {
        let p = PLANETS.randomElement()!
        let s = SIGNS.randomElement()!
        let h = HOUSES.randomElement()!
        lines.append([S.planet, p[0], p[1], S.planetDesc])
        lines.append([S.sign, s[0], s[1], S.signDesc])
        lines.append([S.house, h[0], h[1], S.houseDesc])
        return cjk(p[0]) + "、" + cjk(s[0]) + "、" + h[0] + "；"
    }

    // ================= 雷诺曼 =================
    private func divineLenormand(_ lines: inout [[String]]) -> String {
        var idx: [Int] = []
        let hi = includeSpecial ? LENORMAND.count : LENORMAND_SPECIAL_START
        while idx.count < 3 {
            let i = Int.random(in: 0..<hi)
            if !idx.contains(i) { idx.append(i) }
        }
        let pre = S.cardPre
        var names: [String] = []
        for k in 0..<3 {
            let card = LENORMAND[idx[k]]
            names.append(card[0])
            lines.append([pre[k], card[0], card[1], ""])
        }
        return names.joined(separator: "、") + "；"
    }

    private func drawOracleCards() -> [(card: [String], upright: Bool)] {
        let hi = includeSpecial ? ORACLE.count : ORACLE_SPECIAL_START
        var indices: [Int] = []
        while indices.count < 3 {
            let i = Int.random(in: 0..<hi)
            if !indices.contains(i) { indices.append(i) }
        }
        return indices.map { (ORACLE[$0], Bool.random()) }
    }

    private func oraclePromptSummary(_ drawn: [(card: [String], upright: Bool)]) -> String {
        drawn.map { item in
            item.card[2] + "（" + (item.upright ? "正位" : "逆位") + "；领域：" + item.card[3] + "；流向：" + item.card[4] + "）"
        }.joined(separator: "、") + "；"
    }

    private func divineOracle(_ q: String) {
        let body = drawOracleCards().map { item in
            item.card[2] + "（" + (item.upright ? "正位" : "逆位") + "）\n"
                + "领域：" + item.card[3] + "\n流向：" + item.card[4] + "\n"
                + "关键词：" + item.card[5] + "\n牌义：" + (item.upright ? item.card[6] : item.card[7])
        }.joined(separator: "\n\n")
        copyText = copyBlock(q, title: S.mods[14], body: body)
        addHistory()
        output = [Seg(text: copyText)]
    }

    // ================= 卢恩符文 =================
    private func divineRunes(_ lines: inout [[String]]) -> String {
        var idx: [Int] = []; var used: [String] = []
        while idx.count < 3 {
            let i = Int.random(in: 0..<RUNES.count)
            if !used.contains(RUNES[i][2]) { idx.append(i); used.append(RUNES[i][2]) }
        }
        let pre = S.runePre
        var names: [String] = []
        for k in 0..<3 {
            let rune = RUNES[idx[k]]
            names.append(rune[0])
            lines.append([pre[k], rune[0], rune[1], ""])
        }
        return names.joined(separator: "、") + "；"
    }

    // ================= 玄天灵签 =================
    private func divineQian(_ q: String) {
        let s = pickQian()
        let head = s[0] + "\u{3000}" + s[1] + "\u{3000}" + s[2]
        let labels = S.qianLabels
        let body = ([head] + labels.indices.map { labels[$0] + "：" + s[$0 + 3] }).joined(separator: "\n")
        copyText = copyBlock(q, title: S.mods[6], body: body)
        addHistory()
        output = []
        appendQian(s)
    }
    private func appendQian(_ s: [String]) {
        let head = s[0] + "\u{3000}" + s[1] + "\u{3000}" + s[2]
        let labels = S.qianLabels
        apC(head + "\n")
        for i in 0..<labels.count {
            ap(labels[i] + "：", bold: true)
            ap(s[i + 3])
            if i < labels.count - 1 { ap("\n") }
        }
    }

    // ================= 塔罗 =================
    private var tarotGeneralHi: Int { includeSpecial ? TAROT.count : SPECIAL_TAROT_START }

    private func divineTarot(_ q: String) {
        if curTab == 0 { tarotDraw(q, gen: true, lo: 0, hi: tarotGeneralHi) }
        else if curTab == 1 { tarotYesNo(q) }
        else { tarotDraw(q, gen: false, lo: 56, hi: 100) }
    }

    private func tarotDraw(_ q: String, gen: Bool, lo: Int, hi: Int) {
        var drawn = gen ? drawnGen : drawnMajor
        if drawn.count < hi - lo {
            var i: Int
            repeat { i = lo + Int.random(in: 0..<(hi - lo)) } while drawn.contains(i)
            drawn.append(i)
        }
        if gen { drawnGen = drawn } else { drawnMajor = drawn }
        let names = drawn.map { TAROT[$0][0] }
        copyText = copyBlock(q, title: S.mods[2] + "·" + S.tarotTabs[curTab], body: names.joined(separator: "、"))
        let entry = timeStamp() + "  " + copyText
        let idx = gen ? sessGen : sessMaj
        if idx >= 0 && idx < histories[2].count { histories[2][idx] = entry }
        else {
            histories[2].append(entry)
            if histories[2].count > 30 {
                histories[2].removeFirst()
                if sessGen > 0 { sessGen -= 1 }
                if sessMaj > 0 { sessMaj -= 1 }
            }
            if gen { sessGen = histories[2].count - 1 } else { sessMaj = histories[2].count - 1 }
        }
        saveHistories()
        output = []
        ap(copyText + "\n\n" + S.briefNote + "\n")
        if gen {
            let specials = drawn.filter { $0 >= SPECIAL_TAROT_START }.map { TAROT[$0][0] }
            ap(S.specialCards, bold: true)
            ap("：" + (specials.isEmpty ? S.none : specials.joined(separator: "、")) + "\n")
        }
        for (k, d) in drawn.enumerated() {
            ap(TAROT[d][0], bold: true)
            ap("：" + TAROT[d][1])
            if k < drawn.count - 1 { ap("\n") }
        }
    }

    private func tarotYesNo(_ q: String) {
        let y = YESNO.randomElement()!
        copyText = copyBlock(q, title: S.mods[2] + "·" + S.tarotTabs[curTab], body: y[0] + "，" + y[1] + "：" + y[2] + "（" + y[3] + "）")
        addHistory()
        output = []
        ap(copyText + "\n\n")
        apC(y[0] + "\n")
        ap(y[1], bold: true)
        ap("：" + y[2] + "。" + y[3] + "。")
    }

    // ================= 首页 =================
    private func divineHome(_ q: String) {
        var dummy: [[String]] = []
        var tarotIdx: [Int] = []
        let hi = tarotGeneralHi
        while tarotIdx.count < 3 && tarotIdx.count < hi {
            let i = Int.random(in: 0..<hi)
            if !tarotIdx.contains(i) { tarotIdx.append(i) }
        }
        let tarot = tarotIdx.map { TAROT[$0][0] }.joined(separator: "、") + "；"
        let len = divineLenormand(&dummy)
        let runes = divineRunes(&dummy)
        let astro = divineAstro(&dummy)
        let liuyao = divineLiuYao(&dummy)
        let oracle = oraclePromptSummary(drawOracleCards())
        let qs = pickQian()
        let qianHead = qs[0] + "　" + qs[1] + "　" + qs[2]
        let castDate = Date()
        let traditionalSpecs: [(String, String, [String: Any])] = [
            ("qimen", "奇门遁甲", [:]),
            ("liuren", "大六壬", [:]),
            ("xiaoliuren", "小六壬", [:]),
            ("meihua", "梅花易数", ["method": "time"]),
            ("taiyi", "太乙神数", ["scope": "day"]),
            ("jinkoujue", "金口诀", ["method": "time"]),
        ]
        let traditionalLines = traditionalSpecs.compactMap { method, label, options -> String? in
            var methodOptions = options
            if method != "qimen" { methodOptions.merge(focusOptions()) { current, _ in current } }
            guard let result = try? TraditionalAlgorithmEngine.shared.calculate(method: method, date: castDate, options: methodOptions),
                  !result.summary.isEmpty else { return nil }
            return label + "：" + result.summary
        }
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "zh_CN")
        formatter.dateFormat = "yyyy-MM-dd HH:mm"
        var sections = ["【综合占卜】", "问题：" + q]
        if !focusDescription.isEmpty {
            sections.append((S.isEn ? "Question type / gender: " : "所测何事／性别：") + focusDescription)
        }
        sections += [
            "起卦时间：" + formatter.string(from: castDate), "",
            "【卡牌与卦象】", "塔罗牌：" + tarot, "雷诺曼牌：" + len, "复古神谕：" + oracle,
            "卢恩符文：" + runes, "占星骰子：" + astro,
        ]
        sections += ["", "【传统术数】", "六爻纳甲：" + liuyao] + traditionalLines
        sections += ["", "解读要求：综合各体系的共同指向与矛盾，只依据以上数据。"]
        copyText = sections.joined(separator: "\n")
        addHistoryText(copyText + "\n" + qianHead)
        output = []
        ap(copyText)
        ap("\n\n")
        appendQian(qs)
    }

    private func divineDate(_ q: String) {
        var pool = Array(4...55)
        var drawn: [String] = []
        var ace: String? = nil
        for _ in 1...25 {
            let p = Int.random(in: 0..<pool.count)
            let name = TAROT[pool[p]][0]
            pool.remove(at: p)
            drawn.append(name)
            if ["权杖1", "圣杯1", "宝剑1", "星币1"].contains(name) { ace = name; break }
        }
        var tarotResult: String? = nil
        if ace == nil { tarotResult = S.noWithinYear }
        else {
            var season: String? = nil
            for row in DATE12 where row[0] == ace {
                season = row[1]
                if tarotResult == nil && drawn.contains(row[2]) {
                    tarotResult = row[4]
                    for d in stride(from: 5, through: 9, by: 2) where drawn.contains(row[d]) {
                        tarotResult = row[d + 1]
                        break
                    }
                }
            }
            if tarotResult == nil { tarotResult = (season ?? "") + S.seasonSuffix }
        }
        let p2 = PLANETS.randomElement()!
        let s2 = SIGNS.randomElement()!
        let h2 = HOUSES.randomElement()!
        var body = S.tarotPred + "：" + (tarotResult ?? "") + "\n\n"
            + S.astroPred + "\n"
            + S.baseDuration + "：" + p2[2] + "\n"
            + S.unit + "：" + s2[2] + "\n"
            + S.adjustNum + "：" + h2[2]
        let castDate = Date()
        let timingSpecs: [(String, String, [String: Any])] = [
            ("qimen", "奇门应期", [:]),
            ("liuren", "六壬应期", [:]),
            ("meihua", "梅花应期", ["method": "time"]),
        ]
        let timingLines = timingSpecs.compactMap { method, label, options -> String? in
            guard let result = try? TraditionalAlgorithmEngine.shared.calculate(method: method, date: castDate, options: options),
                  !result.timingSummary.isEmpty else { return nil }
            return label + "：" + result.timingSummary
        }
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.dateFormat = "yyyy-MM-dd"
        let almanacOptions: [String: Any] = [
            "topic": almanacTopic,
            "startDate": formatter.string(from: almanacStartDate),
            "endDate": formatter.string(from: almanacEndDate),
        ]
        let almanacResult = try? TraditionalAlgorithmEngine.shared.calculate(method: "almanac", date: almanacStartDate, options: almanacOptions)
        if !timingLines.isEmpty {
            body += "\n\n【应期参考】\n" + timingLines.joined(separator: "\n")
        }
        if let almanacResult, !almanacResult.display.isEmpty {
            body += "\n\n" + almanacResult.display
        }
        copyText = copyBlock(q, title: S.mods[13].replacingOccurrences(of: "/", with: ""), body: body)
        addHistory()
        output = []
        ap(copyText + "\n\n" + S.briefNote + "\n")
        ap(S.tarotOrder, bold: true)
        ap("：" + drawn.joined(separator: "、") + "\n")
        ap(S.astroDice, bold: true)
        ap("：" + cjk(p2[0]) + "、" + cjk(s2[0]) + "、" + h2[0])
    }

    // ================= 历史 =================
    func timeStamp() -> String {
        let d = Date()
        let df = DateFormatter()
        df.locale = Locale(identifier: "en_US_POSIX")
        df.dateFormat = "yyyy-MM-dd HH:mm"
        let parts = df.string(from: d).split(separator: " ")
        let hm = parts[1].split(separator: ":")
        let hour = Int(hm[0]) ?? 0
        return String(parts[0]) + " " + (hour < 12 ? S.am : S.pm) + String(hm[0]) + "：" + String(hm[1])
    }

    private func addHistory() { addHistoryText(copyText) }

    private func addHistoryText(_ text: String) {
        histories[curModule].append(timeStamp() + "  " + text)
        if histories[curModule].count > 30 {
            histories[curModule].removeFirst()
            if sessGen > 0 { sessGen -= 1 }
            if sessMaj > 0 { sessMaj -= 1 }
        }
        saveHistories()
    }

    func clearHistory(module: Int) {
        histories[module].removeAll()
        if module == 2 { sessGen = -1; sessMaj = -1 }
        saveHistories()
    }

    private var historyURL: URL {
        let dir = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("Divination")
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        return dir.appendingPathComponent("history.dat")
    }
    func saveHistories() {
        var lines: [String] = []
        for (i, h) in histories.enumerated() {
            for item in h { lines.append("\(i)|" + Data(item.utf8).base64EncodedString()) }
        }
        try? lines.joined(separator: "\n").write(to: historyURL, atomically: true, encoding: .utf8)
    }
    private func loadHistories() {
        guard let text = try? String(contentsOf: historyURL, encoding: .utf8) else { return }
        for line in text.split(separator: "\n") {
            guard let pos = line.firstIndex(of: "|"), pos != line.startIndex,
                  let idx = Int(line[line.startIndex..<pos]), idx >= 0, idx < histories.count,
                  let data = Data(base64Encoded: String(line[line.index(after: pos)...])),
                  let item = String(data: data, encoding: .utf8) else { continue }
            histories[idx].append(item)
            if histories[idx].count > 30 { histories[idx].removeFirst() }
        }
    }
}
