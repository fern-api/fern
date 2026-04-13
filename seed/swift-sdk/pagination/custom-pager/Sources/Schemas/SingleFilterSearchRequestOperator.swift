import Foundation

public enum SingleFilterSearchRequestOperator: String, Codable, Hashable, CaseIterable, Sendable {
    case equalTo = "="
    case notEquals = "!="
    case `in` = "IN"
    case nin = "NIN"
    case lessThan = "<"
    case greaterThan = ">"
    case tilde = "~"
    case notTilde = "!~"
    case caret = "^"
    case dollar = "$"
}