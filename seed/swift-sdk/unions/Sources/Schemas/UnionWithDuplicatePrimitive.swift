import Foundation

public enum UnionWithDuplicatePrimitive: Codable, Hashable, Sendable {
    case integer1(Int)
    case integer2(Int)
    case string1(String)
    case string2(String)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "integer1":
            self = .integer1(try container.decode(Int.self, forKey: .value))
        case "integer2":
            self = .integer2(try container.decode(Int.self, forKey: .value))
        case "string1":
            self = .string1(try container.decode(String.self, forKey: .value))
        case "string2":
            self = .string2(try container.decode(String.self, forKey: .value))
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
        case .integer1(let data):
            try container.encode("integer1", forKey: .type)
            try container.encode(data, forKey: .value)
        case .integer2(let data):
            try container.encode("integer2", forKey: .type)
            try container.encode(data, forKey: .value)
        case .string1(let data):
            try container.encode("string1", forKey: .type)
            try container.encode(data, forKey: .value)
        case .string2(let data):
            try container.encode("string2", forKey: .type)
            try container.encode(data, forKey: .value)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
        case value
    }
}