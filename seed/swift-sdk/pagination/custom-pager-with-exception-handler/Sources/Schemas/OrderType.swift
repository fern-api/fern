import Foundation

public enum OrderType: String, Codable, Hashable, CaseIterable, Sendable {
    case asc
    case desc
}