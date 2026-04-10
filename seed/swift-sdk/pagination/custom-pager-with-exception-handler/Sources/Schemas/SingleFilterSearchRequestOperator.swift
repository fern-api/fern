import Foundation

public enum SingleFilterSearchRequestOperator: String, Codable, Hashable, CaseIterable, Sendable {
    case equalTo = "="
    case notEquals = "!="
    case `in` = "IN"
    case nin = "NIN"
    case lessThan = "<"
    case greaterThan = ">"
    case  = "~"
}