import Foundation

public enum MultipleFilterSearchRequestOperator: String, Codable, Hashable, CaseIterable, Sendable {
    case and = "AND"
    case or = "OR"
}