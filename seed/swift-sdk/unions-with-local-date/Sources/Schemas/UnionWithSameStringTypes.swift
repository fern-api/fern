import Foundation

public enum UnionWithSameStringTypes: Codable, Hashable, Sendable {
    case customFormat(UnionWithSameStringTypesCustomFormat)
    case patternString(UnionWithSameStringTypesPatternString)
    case regularString(UnionWithSameStringTypesRegularString)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "customFormat":
            self = .customFormat(try UnionWithSameStringTypesCustomFormat(from: decoder))
        case "patternString":
            self = .patternString(try UnionWithSameStringTypesPatternString(from: decoder))
        case "regularString":
            self = .regularString(try UnionWithSameStringTypesRegularString(from: decoder))
        default:
            throw DecodingError.dataCorrupted(
                DecodingError.Context(
                    codingPath: decoder.codingPath,
                    debugDescription: "Unknown shape discriminant value: \(discriminant)"
                )
            )
        }
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        switch self {
        case .customFormat(let data):
            try container.encode("customFormat", forKey: .type)
            try data.encode(to: encoder)
        case .patternString(let data):
            try container.encode("patternString", forKey: .type)
            try data.encode(to: encoder)
        case .regularString(let data):
            try container.encode("regularString", forKey: .type)
            try data.encode(to: encoder)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}