// 占卜逻辑引擎：完整移植自 Divination.cs
import Foundation
import SwiftUI
import UIKit

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
    @Published var lang: AppLang = AppLang.detect()
    @Published var showCopied = false

    var copyText = ""
    var drawnGen: [Int] = []
    var drawnMajor: [Int] = []
    var sessGen = -1, sessMaj = -1
    var pageSegs: [[Seg]?] = Array(repeating: nil, count: 10)
    var pageCopy: [String?] = Array(repeating: nil, count: 10)
    let SPECIAL_TAROT_START = 156

    var S: L10n { L10n.of(lang) }
    var mods: [String] { S.mods }
    var tarotTabs: [String] { S.tarotTabs }
    var homeTabs: [String] { S.homeTabs }
    var helpText: String { S.helpText }

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
        if q.isEmpty { q = S.emptyQuestion }
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
        ap(copyText + "\n\n" + S.briefNote + "\n")
        for (i, ln) in lines.enumerated() {
            ap(ln[0])
            ap(ln[1], bold: true)
            ap("：" + ln[2] + "。")
            if !ln[3].isEmpty { ap(ln[3], italic: true) }
            if i < lines.count - 1 { ap("\n") }
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
        drawnGen.removeAll(); drawnMajor.removeAll()
        sessGen = -1; sessMaj = -1
        let p = pageIndex()
        pageSegs[p] = nil; pageCopy[p] = nil
    }
    static func toClipboard(_ s: String) {
        UIPasteboard.general.string = s
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
        let rows = S.liuYaoRows
        lines.append([rows[0][0], ben[0],  ben[3],  rows[0][1]])
        lines.append([rows[1][0], bian[0], bian[3], rows[1][1]])
        lines.append([rows[2][0], hu[0],   hu[3],   rows[2][1]])
        lines.append([rows[3][0], cuog[0], cuog[3], rows[3][1]])
        lines.append([rows[4][0], zong[0], zong[3], rows[4][1]])
        return S.liuYaoSummary(ben: ben, dong: dong, bian: bian, hu: hu, cuo: cuog, zong: zong)
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
        while idx.count < 3 {
            let i = Int.random(in: 0..<LENORMAND.count)
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

    // ================= 玄天上帝感应灵签 =================
    private func divineQian(_ q: String) {
        let s = pickQian()
        let head = s[0] + "\u{3000}" + s[1] + "\u{3000}" + s[2]
        let labels = S.qianLabels
        var sb = q + "：" + head
        for i in 0..<labels.count { sb += "\n" + labels[i] + "：" + s[i + 3] }
        copyText = sb
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
        copyText = q + "：" + names.joined(separator: "、") + "；"
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
        let qs = pickQian()
        let qianHead = qs[0] + "　" + qs[1] + "　" + qs[2]
        copyText = q + "：" + tarot + len + runes + astro + liuyao
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
        copyText = q + "\n"
            + S.tarotPred + "：" + (tarotResult ?? "") + "\n\n"
            + S.astroPred + "：\n"
            + S.baseDuration + "：" + p2[2] + "\n"
            + S.unit + "：" + s2[2] + "\n"
            + S.adjustNum + "：" + h2[2]
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
