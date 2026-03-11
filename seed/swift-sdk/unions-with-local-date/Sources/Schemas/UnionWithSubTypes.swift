import Foundation

public enum UnionWithSubTypes: Codable, Hashable, Sendable {
    case foo(Foo)
    case fooExtended(FooExtended)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "foo":
            self = .foo(try Foo(from: decoder))
        case "fooExtended":
            self = .fooExtended(try FooExtended(from: decoder))
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
        case .fooExtended(let data):
            try container.encode("fooExtended", forKey: .type)
            try data.encode(to: encoder)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}