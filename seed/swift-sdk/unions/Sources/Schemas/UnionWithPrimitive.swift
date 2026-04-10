import Foundation

public enum UnionWithPrimitive: Codable, Hashable, Sendable {
    case integer(UnionWithPrimitiveInteger)
    case string(UnionWithPrimitiveString)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "integer":
            self = .integer(try UnionWithPrimitiveInteger(from: decoder))
        case "string":
            self = .string(try UnionWithPrimitiveString(from: decoder))
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
        case .integer(let data):
            try container.encode("integer", forKey: .type)
            try data.encode(to: encoder)
        case .string(let data):
            try container.encode("string", forKey: .type)
            try data.encode(to: encoder)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}