import Foundation

public enum UnionWithOptionalReference: Codable, Hashable, Sendable {
    case bar(UnionWithOptionalReferenceBar)
    case foo(UnionWithOptionalReferenceFoo)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "bar":
            self = .bar(try UnionWithOptionalReferenceBar(from: decoder))
        case "foo":
            self = .foo(try UnionWithOptionalReferenceFoo(from: decoder))
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
        case .bar(let data):
            try container.encode("bar", forKey: .type)
            try data.encode(to: encoder)
        case .foo(let data):
            try container.encode("foo", forKey: .type)
            try data.encode(to: encoder)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}