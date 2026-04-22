import Foundation

public enum UnionWithDiscriminant: Codable, Hashable, Sendable {
    case bar(Bar)
    /// This is a Foo field.
    case foo(Foo)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "bar":
            self = .bar(try container.decode(Bar.self, forKey: .bar))
        case "foo":
            self = .foo(try container.decode(Foo.self, forKey: .foo))
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
            try container.encode(data, forKey: .bar)
        case .foo(let data):
            try container.encode("foo", forKey: .type)
            try container.encode(data, forKey: .foo)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type = "_type"
        case bar
        case foo
    }
}