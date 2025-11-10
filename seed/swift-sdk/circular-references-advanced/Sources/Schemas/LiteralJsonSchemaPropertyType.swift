import Foundation

public enum LiteralJsonSchemaPropertyType: String, Codable, Hashable, CaseIterable, Sendable {
    case string
    case number
    case boolean
}