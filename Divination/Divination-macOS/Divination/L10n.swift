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
        mods: ["首页", "六爻纳甲", "塔罗", "雷诺曼", "卢恩符文", "占星骰子", "玄天灵签", "奇门遁甲", "大六壬", "小六壬", "梅花易数", "太乙神数", "金口诀", "择日/黄历", "复古神谕"],
        modTabs: ["首页", "六爻纳甲", "塔罗牌", "雷诺曼牌", "卢恩符文", "占星骰子", "玄天灵签", "奇门遁甲", "大六壬", "小六壬", "梅花易数", "太乙神数", "金口诀", "择日黄历", "复古神谕"],
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
        specialWarnTitle: "特殊牌说明",
        specialWarnText: "此开关同时启用塔罗特殊牌、国色华光雷诺曼扩展牌和复古神谕强调牌。",
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
        1. 选择占卜方式：综合=多体系合参；塔罗／复古神谕／卢恩=心理、关系与建议；雷诺曼=现实事件与消息；占星骰子=快速看影响领域；玄天灵签=整体签意；六爻=具体事件成败与应期；奇门=行动、时机与方向；大六壬=复杂人事过程；小六壬=临时小事；梅花=即时趋势与应期；太乙=宏观局势；金口诀=近期具体人事；择日／黄历=选日期。

        2. 提问建议：尽量一事一问；婚恋／婚姻需选择性别；同一事项没有新变化时不建议反复重占。

        3. 其他：“包含特殊牌”同时启用塔罗特殊牌、雷诺曼扩展牌和复古神谕强调牌；每个模块保存最近30条历史；“复制结果”可直接用于AI解读。
        """
    )

    static let en = L10n(
        lang: .en,
        mods: ["Home", "I Ching", "Tarot", "Lenormand", "Runes", "Astro Dice", "Fortune Slip", "Qimen", "Da Liu Ren", "Xiao Liu Ren", "Meihua Yishu", "Taiyi", "Jin Kou Jue", "Date Selection", "Old Style Oracle"],
        modTabs: ["Home", "I Ching", "Tarot", "Lenormand", "Runes", "Astro Dice", "Slip", "Qimen", "Da Liu Ren", "Xiao Liu Ren", "Meihua", "Taiyi", "Jin Kou Jue", "Date Select", "Old Oracle"],
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
        specialWarnTitle: "About special cards",
        specialWarnText: "This switch enables special Tarot cards, Guose Huaguang Lenormand extensions, and Old Style Oracle accent cards.",
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
        1. Choose a method: Combined=multi-system overview; Tarot/Old Style Oracle/Runes=psychology, relationships and guidance; Lenormand=real-world events and messages; Astro Dice=quick influence/area check; Fortune Slip=overall oracle; I Ching=specific outcomes and timing; Qimen=action, timing and direction; Da Liu Ren=complex people/events; Xiao Liu Ren=quick everyday matters; Meihua=immediate trend/timing; Taiyi=macro trends; Jin Kou Jue=near-term concrete matters; Date Selection=choose dates.

        2. Questions: keep to one matter per reading; love/marriage questions require gender; avoid repeated readings unless the situation has materially changed.

        3. Other: Include special cards enables Tarot specials, Lenormand extensions and Oracle accent cards; each module keeps the latest 30 history items; Copy Result is ready for AI interpretation.
        """
    )
}
