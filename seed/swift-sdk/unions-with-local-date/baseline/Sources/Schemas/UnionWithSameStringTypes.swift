import Foundation

public enum UnionWithSameStringTypes: Codable, Hashable, Sendable {
    case customFormat(String)
    case patternString(String)
    case regularString(String)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "customFormat":
            self = .customFormat(try container.decode(String.self, forKey: .value))
        case "patternString":
            self = .patternString(try container.decode(String.self, forKey: .value))
        case "regularString":
            self = .regularString(try container.decode(String.self, forKey: .value))
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
            try container.encode(data, forKey: .value)
        case .patternString(let data):
            try container.encode("patternString", forKey: .type)
            try container.encode(data, forKey: .value)
        case .regularString(let data):
            try container.encode("regularString", forKey: .type)
            try container.encode(data, forKey: .value)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
        case value
    }
}