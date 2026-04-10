import Foundation

/// Tests enum name and value can be
/// different.
public enum Operand: String, Codable, Hashable, CaseIterable, Sendable {
    case greaterThan = ">"
    case equalTo = "="
    case lessThan = "less_than"
}