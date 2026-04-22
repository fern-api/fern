import Foundation

public enum Shape: String, Codable, Hashable, CaseIterable, Sendable {
    case square = "SQUARE"
    case circle = "CIRCLE"
    case triangle = "TRIANGLE"
}