import Foundation

public enum UnionWithBaseProperties: Codable, Hashable, Sendable {
    case foo(Foo)
    case integer(Int)
    case string(String)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "foo":
            self = .foo(try Foo(from: decoder))
        case "integer":
            self = .integer(try container.decode(Int.self, forKey: .value))
        case "string":
            self = .string(try container.decode(String.self, forKey: .value))
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
        case .foo(let data):
            try container.encode("foo", forKey: .type)
            try data.encode(to: encoder)
        case .integer(let data):
            try container.encode("integer", forKey: .type)
            try container.encode(data, forKey: .value)
        case .string(let data):
            try container.encode("string", forKey: .type)
            try container.encode(data, forKey: .value)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
        case value
    }
}