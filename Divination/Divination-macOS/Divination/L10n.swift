import Foundation

enum AppLang: String {
    case zh, en

    static func detect() -> AppLang {
        if let saved = UserDefaults.standard.string(forKey: "divination_lang"),
           let lang = AppLang(rawValue: saved) {
            return lang
        }
        let pref = Locale.preferredLanguages.first?.lowercased() ?? ""
        return pref.hasPrefix("zh") ? .zh : .en
    }
}

struct L10n {
    let lang: AppLang
    let mods: [String]
    let modTabs: [String]
    let tarotTabs: [String]
    let homeTabs: [String]
    let qianLabels: [String]
    let cardPre: [String]
    let runePre: [String]
    let liuYaoRows: [[String]]
    let inputLabel: String
    let copy: String
    let clear: String
    let history: String
    let help: String
    let histCopyAll: String
    let histClearAll: String
    let close: String
    let ok: String
    let helpTitle: String
    let copied: String
    let includeSpecial: String
    let dateWarn: String
    let emptyQuestion: String
    let briefNote: String
    let specialCards: String
    let none: String
    let specialWarnTitle: String
    let specialWarnText: String
    let am: String
    let pm: String
    let goHome: String
    let goLiuYao: String
    let goDice: String
    let goQian: String
    let goDraw: String
    let planet: String
    let sign: String
    let house: String
    let planetDesc: String
    let signDesc: String
    let houseDesc: String
    let dongYaoNone: String
    let tarotPred: String
    let astroPred: String
    let baseDuration: String
    let unit: String
    let adjustNum: String
    let tarotOrder: String
    let astroDice: String
    let noWithinYear: String
    let seasonSuffix: String
    let langBtn: String
    let helpText: String

    var isEn: Bool { lang == .en }
    var upperTrigram: String { isEn ? "Upper" : "上卦" }
    var lowerTrigram: String { isEn ? "Lower" : "下卦" }
    var movingLines: String { isEn ? "Moving" : "动爻" }
    var completeTrigrams: String { isEn ? "Select both the upper and lower trigrams for a manual cast." : "手动起卦请同时选择上卦和下卦。" }

    func histTitle(_ name: String) -> String {
        isEn ? "History - \(name)" : "历史 - \(name)"
    }

    func histTitleLong(_ name: String) -> String {
        isEn ? "History - \(name) (last 30)" : "历史记录 - \(name)（最近30条）"
    }

    func liuYaoSummary(ben: [String], dong: [String], bian: [String], hu: [String], cuo: [String], zong: [String]) -> String {
        let sep = isEn ? ", " : "、"
        let dongText = dong.isEmpty ? dongYaoNone : dong.joined(separator: sep)
        if isEn {
            return "Primary \(ben[0]), moving \(dongText), self \(ben[1]), other \(ben[2]), changed \(bian[0]), mutual \(hu[0]), opposite \(cuo[0]), inverted \(zong[0]);"
        }
        return "本卦\(ben[0])，动爻\(dongText)，世爻\(ben[1])，应爻\(ben[2])，变卦\(bian[0])，互卦\(hu[0])，错卦\(cuo[0])，综卦\(zong[0])；"
    }

    static func of(_ lang: AppLang) -> L10n {
        lang == .zh ? zh : en
    }

    static let zh = L10n(
        lang: .zh,
        mods: ["首页", "六爻", "塔罗", "雷诺曼", "卢恩符文", "占星骰子", "玄天上帝感应灵签", "奇门遁甲", "大六壬", "小六壬", "梅花易数", "太乙神数", "金口诀", "择日/黄历"],
        modTabs: ["首页", "六爻", "塔罗", "雷诺曼", "卢恩", "占星", "灵签"],
        tarotTabs: ["通用", "YES OR NO", "大牌"],
        homeTabs: ["综合占卜"],
        qianLabels: ["圣意", "谋望", "家宅", "婚姻", "失物", "官事", "行人", "占病", "解曰"],
        cardPre: ["第一张", "第二张", "第三张"],
        runePre: ["第一枚", "第二枚", "第三枚"],
        liuYaoRows: [
            ["本卦", "【事情的现状】"],
            ["变卦", "【事情的最终结果】"],
            ["互卦", "【事情发展过程中的内在矛盾/隐藏动态】"],
            ["错卦", "【事情的反面状态，即\"不是什么\"】"],
            ["综卦", "【从另一个角度看这件事，或错误处理方式的后果】"]
        ],
        inputLabel: "输入问题：",
        copy: "复制结果",
        clear: "清空",
        history: "历史",
        help: "说明",
        histCopyAll: "复制全部",
        histClearAll: "清除全部",
        close: "关闭",
        ok: "确定",
        helpTitle: "使用说明",
        copied: "已复制",
        includeSpecial: "包含特殊牌",
        dateWarn: "未作校准，仅供参考，自行甄别",
        emptyQuestion: "（未填写问题）",
        briefNote: "―― 简要说明 ――",
        specialCards: "特殊牌",
        none: "无",
        specialWarnTitle: "特殊塔罗牌说明",
        specialWarnText: "如果没有特殊牌义的解读包，建议给 AI 的解读不要使用特殊牌。",
        am: "上午",
        pm: "下午",
        goHome: "占 卜",
        goLiuYao: "起 卦",
        goDice: "掷骰子",
        goQian: "求 签",
        goDraw: "抽 牌",
        planet: "行星",
        sign: "星座",
        house: "宫位",
        planetDesc: "【做什么：发挥这股能量】",
        signDesc: "【怎么做：以这种方式】",
        houseDesc: "【在哪里做：在这个领域】",
        dongYaoNone: "无",
        tarotPred: "塔罗预测",
        astroPred: "占星预测",
        baseDuration: "基础时长",
        unit: "计量单位",
        adjustNum: "调整数字",
        tarotOrder: "塔罗抽牌顺序",
        astroDice: "占星骰子",
        noWithinYear: "一年内无",
        seasonSuffix: "季",
        langBtn: "EN",
        helpText: """
        1. 首页-综合占卜：一次生成塔罗三张牌、雷诺曼三张、卢恩三枚、占星骰子、六爻，界面结果末尾附灵签内容。复制结果不含灵签，历史记录仅追加灵签签头。

        2. 择日／黄历：除黄历候选外，同时给出塔罗日期、占星时长及奇门／六壬／梅花应期参考。

        3. 塔罗-通用：默认不包含特殊牌；勾选“包含特殊牌”后，通用塔罗与首页综合占卜的塔罗部分都会纳入特殊牌。YES OR NO 与大牌不受此选项影响。如果没有特殊牌义的解读包，建议给 AI 的解读不要使用特殊牌。

        4. 历史记录会保存30条，下次打开程序仍可查看。

        5. 复制结果可直接粘贴到AI解读。
        """
    )

    static let en = L10n(
        lang: .en,
        mods: ["Home", "I Ching", "Tarot", "Lenormand", "Runes", "Astro Dice", "Fortune Slip", "Qimen", "Da Liu Ren", "Xiao Liu Ren", "Meihua Yishu", "Taiyi", "Jin Kou Jue", "Date Selection"],
        modTabs: ["Home", "I Ching", "Tarot", "Lenormand", "Runes", "Astro Dice", "Slip"],
        tarotTabs: ["General", "YES OR NO", "Major"],
        homeTabs: ["Combined"],
        qianLabels: ["Oracle", "Ambition", "Home", "Marriage", "Lost item", "Legal", "Traveler", "Illness", "Summary"],
        cardPre: ["Card 1", "Card 2", "Card 3"],
        runePre: ["Rune 1", "Rune 2", "Rune 3"],
        liuYaoRows: [
            ["Primary", "【Current situation】"],
            ["Changed", "【Final outcome】"],
            ["Mutual", "【Hidden dynamics during the process】"],
            ["Opposite", "【What it is not】"],
            ["Inverted", "【Another angle, or consequences of mishandling】"]
        ],
        inputLabel: "Question:",
        copy: "Copy",
        clear: "Clear",
        history: "History",
        help: "Help",
        histCopyAll: "Copy all",
        histClearAll: "Clear all",
        close: "Close",
        ok: "OK",
        helpTitle: "Help",
        copied: "Copied",
        includeSpecial: "Include special cards",
        dateWarn: "Uncalibrated; for reference only",
        emptyQuestion: "(No question entered)",
        briefNote: "―― Brief notes ――",
        specialCards: "Special cards",
        none: "None",
        specialWarnTitle: "About special Tarot cards",
        specialWarnText: "If you do not have a meaning pack for special cards, do not include special cards when sending a reading to AI.",
        am: "AM",
        pm: "PM",
        goHome: "Divine",
        goLiuYao: "Cast",
        goDice: "Roll",
        goQian: "Draw slip",
        goDraw: "Draw",
        planet: "Planet",
        sign: "Sign",
        house: "House",
        planetDesc: "【Action: how to apply this energy】",
        signDesc: "【Manner: in this way】",
        houseDesc: "【Area: in this life domain】",
        dongYaoNone: "None",
        tarotPred: "Tarot timing",
        astroPred: "Astro timing",
        baseDuration: "Base duration",
        unit: "Unit",
        adjustNum: "Adjustment",
        tarotOrder: "Tarot draw order",
        astroDice: "Astro dice",
        noWithinYear: "None within a year",
        seasonSuffix: " season",
        langBtn: "中文",
        helpText: """
        1. Home - Combined: draws 3 Tarot, 3 Lenormand, 3 Runes, astro dice, and I Ching in one go. The fortune slip is shown at the end of on-screen results. Copy excludes the slip body; history appends only the slip header.

        2. Date Selection: includes almanac candidates, Tarot/Astro timing, and Qimen/Liuren/Meihua timing references.

        3. Tarot - General: special cards off by default. When enabled, they apply to General and Home combined Tarot. YES OR NO and Major Arcana are unaffected. Without a special-card meaning pack, avoid including special cards in AI readings.

        4. History keeps the last 30 entries per module.

        5. Copy results and paste into an AI for interpretation.

        Note: card names, runes, and hexagrams remain in Chinese; fortune-slip text is translated in English mode.
        """
    )
}
