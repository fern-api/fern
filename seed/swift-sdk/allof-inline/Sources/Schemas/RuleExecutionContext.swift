import Foundation

/// Execution environment for a rule.
public enum RuleExecutionContext: String, Codable, Hashable, CaseIterable, Sendable {
    case prod
    case staging
    case dev
}