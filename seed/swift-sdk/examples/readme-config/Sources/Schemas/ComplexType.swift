import Foundation

public enum ComplexType: String, Codable, Hashable, CaseIterable, Sendable {
    case object
    case union
    case unknown
}