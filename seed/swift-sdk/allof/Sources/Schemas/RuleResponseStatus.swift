import Foundation

public enum RuleResponseStatus: String, Codable, Hashable, CaseIterable, Sendable {
    case active
    case inactive
    case draft
}