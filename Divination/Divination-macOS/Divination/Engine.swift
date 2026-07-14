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
    @Published var histories: [[String]] = Array(repeating: [], count: 7)

    var copyText = ""
    var drawnGen: [Int] = []
    var drawnMajor: [Int] = []
    var sessGen = -1, sessMaj = -1
    var pageSegs: [[Seg]?] = Array(repeating: nil, count: 10)
    var pageCopy: [String?] = Array(repeating: nil, count: 10)
    let SPECIAL_TAROT_START = 156

    let mods = ["首页", "六爻", "塔罗", "雷诺曼", "卢恩符文", "占星骰子", "玄天上帝感应灵签"]
    let tarotTabs = ["通用", "YES OR NO", "大牌"]
    let homeTabs = ["综合占卜", "日期预测"]

    init() { loadHistories() }

    var goButtonText: String {
        switch curModule {
        case 0: return "占 卜"
        case 1: return "起 卦"
        case 5: return "掷骰子"
        case 6: return "求 签"
        default: return "抽 牌"
        }
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
        return 6 + (curModule - 3)
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
    func switchModule(_ i: Int) { saveState(); curModule = i; restoreState() }
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
        var q = question.trimmingCharacters(in: .whitespaces)
        if q.isEmpty { q = "（未填写问题）" }
        doDivine(q)
        saveState()
    }

    private func doDivine(_ q: String) {
        if curModule == 0 { if curHomeTab == 0 { divineHome(q) } else { divineDate(q) }; return }
        if curModule == 6 { divineQian(q); return }
        if curModule == 2 { divineTarot(q); return }
        var lines: [[String]] = []
        let result: String
        if curModule == 1 { result = divineLiuYao(&lines) }
        else if curModule == 3 { result = divineLenormand(&lines) }
        else if curModule == 4 { result = divineRunes(&lines) }
        else { result = divineAstro(&lines) }
        copyText = q + "：" + result
        output = []
        addHistory()
        ap(copyText + "\n\n―― 简要说明 ――\n")
        for (i, ln) in lines.enumerated() {
            ap(ln[0])
            ap(ln[1], bold: true)
            ap("：" + ln[2] + "。")
            if !ln[3].isEmpty { ap(ln[3], italic: true) }
            if i < lines.count - 1 { ap("\n") }
        }
    }

    @Published var showCopied = false

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

    private func divineLiuYao(_ lines: inout [[String]]) -> String {
        var h = [String](repeating: "", count: 6)
        var z = h, c = h
        for i in 0..<6 {
            var heads = 0
            for _ in 0..<3 where Int.random(in: 0..<2) == 0 { heads += 1 }
            let t = lineOfToss(heads)
            h[i] = t.ben; z[i] = t.zhi; c[i] = t.cuo
        }
        let ben  = hexg(elem(h[5], h[4], h[3]), elem(h[2], h[1], h[0]))
        let bian = hexg(elem(z[5], z[4], z[3]), elem(z[2], z[1], z[0]))
        let hu   = hexg(elem(h[4], h[3], h[2]), elem(h[3], h[2], h[1]))
        let cuog = hexg(elem(c[5], c[4], c[3]), elem(c[2], c[1], c[0]))
        let zong = hexg(elem(h[0], h[1], h[2]), elem(h[3], h[4], h[5]))
        var dong: [String] = []
        for i in 0..<6 where h[i].contains("○") { dong.append(POS[i]) }
        lines.append(["本卦", ben[0],  ben[3],  "【事情的现状】"])
        lines.append(["变卦", bian[0], bian[3], "【事情的最终结果】"])
        lines.append(["互卦", hu[0],   hu[3],   "【事情发展过程中的内在矛盾/隐藏动态】"])
        lines.append(["错卦", cuog[0], cuog[3], "【事情的反面状态，即\"不是什么\"】"])
        lines.append(["综卦", zong[0], zong[3], "【从另一个角度看这件事，或错误处理方式的后果】"])
        return "本卦" + ben[0] + "，动爻" + dong.joined(separator: "、")
             + "，世爻" + ben[1] + "，应爻" + ben[2]
             + "，变卦" + bian[0] + "，互卦" + hu[0]
             + "，错卦" + cuog[0] + "，综卦" + zong[0] + "；"
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
        lines.append(["行星", p[0], p[1], "【做什么：发挥这股能量】"])
        lines.append(["星座", s[0], s[1], "【怎么做：以这种方式】"])
        lines.append(["宫位", h[0], h[1], "【在哪里做：在这个领域】"])
        return cjk(p[0]) + "、" + cjk(s[0]) + "、" + h[0] + "；"
    }

    // ================= 雷诺曼 =================
    private func divineLenormand(_ lines: inout [[String]]) -> String {
        var idx: [Int] = []
        while idx.count < 3 {
            let i = Int.random(in: 0..<LENORMAND.count)
            if !idx.contains(i) { idx.append(i) }
        }
        let pre = ["第一张", "第二张", "第三张"]
        var names: [String] = []
        for k in 0..<3 {
            let card = LENORMAND[idx[k]]
            names.append(card[0])
            lines.append([pre[k], card[0], card[1], ""])
        }
        return names.joined(separator: "、") + "；"
    }

    // ================= 卢恩符文 =================
    private func divineRunes(_ lines: inout [[String]]) -> String {
        var idx: [Int] = []; var used: [String] = []
        while idx.count < 3 {
            let i = Int.random(in: 0..<RUNES.count)
            if !used.contains(RUNES[i][2]) { idx.append(i); used.append(RUNES[i][2]) }
        }
        let pre = ["第一枚", "第二枚", "第三枚"]
        var names: [String] = []
        for k in 0..<3 {
            let rune = RUNES[idx[k]]
            names.append(rune[0])
            lines.append([pre[k], rune[0], rune[1], ""])
        }
        return names.joined(separator: "、") + "；"
    }

    // ================= 玄天上帝感应灵签 =================
    private func divineQian(_ q: String) {
        let s = QIAN.randomElement()!
        let head = s[0] + "\u{3000}" + s[1] + "\u{3000}" + s[2]
        let labels = ["圣意", "谋望", "家宅", "婚姻", "失物", "官事", "行人", "占病", "解曰"]
        var sb = q + "：" + head
        for i in 0..<labels.count { sb += "\n" + labels[i] + "：" + s[i + 3] }
        copyText = sb
        addHistory()
        output = []
        appendQian(s)
    }
    private func appendQian(_ s: [String]) {
        let head = s[0] + "\u{3000}" + s[1] + "\u{3000}" + s[2]
        let labels = ["圣意", "谋望", "家宅", "婚姻", "失物", "官事", "行人", "占病", "解曰"]
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
        copyText = q + "：" + names.joined(separator: "、") + "；"
        // 同一轮累积抽牌更新同一条历史
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
        ap(copyText + "\n\n―― 简要说明 ――\n")
        if gen {
            let specials = drawn.filter { $0 >= SPECIAL_TAROT_START }.map { TAROT[$0][0] }
            ap("特殊牌", bold: true)
            ap("：" + (specials.isEmpty ? "无" : specials.joined(separator: "、")) + "\n")
        }
        for (k, d) in drawn.enumerated() {
            ap(TAROT[d][0], bold: true)
            ap("：" + TAROT[d][1])
            if k < drawn.count - 1 { ap("\n") }
        }
    }

    private func tarotYesNo(_ q: String) {
        let y = YESNO.randomElement()!  // {判定, 牌, 短语, 解释}
        copyText = q + "：" + y[0] + "，" + y[1] + "：" + y[2] + "（" + y[3] + "）"
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
        let qs = QIAN.randomElement()!
        let qianHead = qs[0] + "　" + qs[1] + "　" + qs[2]
        copyText = q + "：" + tarot + len + runes + astro + liuyao  // 复制不含灵签
        addHistoryText(copyText + "\n" + qianHead)  // 历史仅追加灵签签头
        output = []
        ap(copyText)
        ap("\n\n")  // 界面结果末尾附灵签内容（复制与历史不变）
        appendQian(qs)
    }

    private func divineDate(_ q: String) {
        // 塔罗日期：抽牌最多25张，抽到首牌为止（结果只显示季节或时间段）
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
        if ace == nil { tarotResult = "一年内无" }
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
            if tarotResult == nil { tarotResult = (season ?? "") + "季" }
        }
        // 占星骰子日期：行星=基础时长，星座=计量单位，宫位=调整数字
        let p2 = PLANETS.randomElement()!
        let s2 = SIGNS.randomElement()!
        let h2 = HOUSES.randomElement()!
        copyText = q + "\n"
            + "塔罗预测：" + (tarotResult ?? "") + "\n\n"
            + "占星预测：\n"
            + "基础时长：" + p2[2] + "\n"
            + "计量单位：" + s2[2] + "\n"
            + "调整数字：" + h2[2]
        addHistory()
        output = []
        ap(copyText + "\n\n―― 简要说明 ――\n")
        ap("塔罗抽牌顺序", bold: true)
        ap("：" + drawn.joined(separator: "、") + "\n")
        ap("占星骰子", bold: true)
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
        return String(parts[0]) + " " + (hour < 12 ? "上午" : "下午") + String(hm[0]) + "：" + String(hm[1])
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

    // ================= 持久化（与Windows版同格式：模块号|Base64） =================
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

    let helpText = """
    1. 首页-综合占卜：一次生成塔罗三张牌、雷诺曼三张、卢恩三枚、占星骰子、六爻，界面结果末尾附灵签内容。复制结果不含灵签，历史记录仅追加灵签签头。

    2. 首页-日期预测：理论上无法验证准确时间，仅供参考，自行甄别。

    3. 塔罗-通用：默认不包含特殊牌；勾选"包含特殊牌"后，通用塔罗与首页综合占卜的塔罗部分都会纳入特殊牌。YES OR NO 与大牌不受此选项影响。

    4. 历史记录会保存30条，下次打开程序仍可查看。
    
    5. 复制结果可直接粘贴到AI解读。
    """
}
