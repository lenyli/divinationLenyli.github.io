import Foundation
import JavaScriptCore

struct TraditionalCalculation {
    let display: String
    let aiPrompt: String
    let aiPromptSection: String
    let aiPromptVersion: String
    let summary: String
    let timingSummary: String
    let methodVersion: String
    let input: [String: Any]
    let calculatedFacts: Any
    let limitations: [String]
    let provenance: [String: Any]
}

enum TraditionalAlgorithmError: LocalizedError {
    case resourceMissing
    case javascript(String)
    case invalidResponse

    var errorDescription: String? {
        switch self {
        case .resourceMissing: return "本地算法资源缺失。"
        case .javascript(let message): return message
        case .invalidResponse: return "算法返回格式无效。"
        }
    }
}

final class TraditionalAlgorithmEngine {
    static let shared = TraditionalAlgorithmEngine()
    private let context: JSContext?
    private var loadError: TraditionalAlgorithmError?

    private init() {
        context = JSContext()
        context?.exceptionHandler = { _, exception in
            if let message = exception?.toString(), !message.isEmpty {
                NSLog("Traditional algorithms JavaScript error: %@", message)
            }
        }
        guard let url = Bundle.main.url(forResource: "traditional-algorithms", withExtension: "js"),
              let source = try? String(contentsOf: url, encoding: .utf8) else {
            loadError = .resourceMissing
            return
        }
        context?.evaluateScript(source)
    }

    func calculate(method: String, date: Date, options: [String: Any]) throws -> TraditionalCalculation {
        if let loadError { throw loadError }
        guard let context,
              let api = context.objectForKeyedSubscript("ZhanbuAlgorithms"),
              let function = api.objectForKeyedSubscript("calculate") else {
            throw TraditionalAlgorithmError.resourceMissing
        }
        let optionsData = try JSONSerialization.data(withJSONObject: options)
        let optionsJSON = String(data: optionsData, encoding: .utf8) ?? "{}"
        guard let raw = function.call(withArguments: [method, date.timeIntervalSince1970 * 1000, optionsJSON])?.toString(),
              let data = raw.data(using: .utf8),
              let root = try JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            throw TraditionalAlgorithmError.invalidResponse
        }
        guard root["ok"] as? Bool == true else {
            throw TraditionalAlgorithmError.javascript(root["error"] as? String ?? "算法计算失败。")
        }
        guard let result = root["result"] as? [String: Any],
              let display = result["display"] as? String else {
            throw TraditionalAlgorithmError.invalidResponse
        }
        return TraditionalCalculation(
            display: display,
            aiPrompt: result["aiPrompt"] as? String ?? "",
            aiPromptSection: result["aiPromptSection"] as? String ?? "",
            aiPromptVersion: result["aiPromptVersion"] as? String ?? "",
            summary: result["summary"] as? String ?? "",
            timingSummary: result["timingSummary"] as? String ?? "",
            methodVersion: result["methodVersion"] as? String ?? "",
            input: result["input"] as? [String: Any] ?? [:],
            calculatedFacts: result["calculatedFacts"] ?? NSNull(),
            limitations: result["limitations"] as? [String] ?? [],
            provenance: result["provenance"] as? [String: Any] ?? [:]
        )
    }
}
