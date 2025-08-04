public enum SingleFilterSearchRequestOperator: String, Codable, Hashable, CaseIterable, Sendable {
    case equals = "="
    case notEquals = "!="
    case `in` = "IN"
    case notIn = "NIN"
    case lessThan = "<"
    case greaterThan = ">"
    case contains = "~"
    case doesNotContain = "!~"
    case startsWith = "^"
    case endsWith = "$"
}