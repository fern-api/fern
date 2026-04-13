import Foundation

public enum UnionWithDuplicatePrimitive: Codable, Hashable, Sendable {
    case integer1(UnionWithDuplicatePrimitiveInteger1)
    case integer2(UnionWithDuplicatePrimitiveInteger2)
    case string1(UnionWithDuplicatePrimitiveString1)
    case string2(UnionWithDuplicatePrimitiveString2)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "integer1":
            self = .integer1(try UnionWithDuplicatePrimitiveInteger1(from: decoder))
        case "integer2":
            self = .integer2(try UnionWithDuplicatePrimitiveInteger2(from: decoder))
        case "string1":
            self = .string1(try UnionWithDuplicatePrimitiveString1(from: decoder))
        case "string2":
            self = .string2(try UnionWithDuplicatePrimitiveString2(from: decoder))
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
            try data.encode(to: encoder)
        case .integer2(let data):
            try container.encode("integer2", forKey: .type)
            try data.encode(to: encoder)
        case .string1(let data):
            try container.encode("string1", forKey: .type)
            try data.encode(to: encoder)
        case .string2(let data):
            try container.encode("string2", forKey: .type)
            try data.encode(to: encoder)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}