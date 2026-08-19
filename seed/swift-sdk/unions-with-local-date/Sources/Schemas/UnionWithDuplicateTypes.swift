import Foundation

public enum UnionWithDuplicateTypes: Codable, Hashable, Sendable {
    case foo1(Foo)
    case foo2(Foo)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "foo1":
            self = .foo1(try Foo(from: decoder))
        case "foo2":
            self = .foo2(try Foo(from: decoder))
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
        case .foo1(let data):
            try container.encode("foo1", forKey: .type)
            try data.encode(to: encoder)
        case .foo2(let data):
            try container.encode("foo2", forKey: .type)
            try data.encode(to: encoder)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}