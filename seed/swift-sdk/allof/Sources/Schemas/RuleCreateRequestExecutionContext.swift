import Foundation

/// Execution context for the rule, excluding the prod environment.
public enum RuleCreateRequestExecutionContext: String, Codable, Hashable, CaseIterable, Sendable {
    case prod
    case staging
    case dev
}