import Foundation

public enum UnionWithMultipleNoProperties: Codable, Hashable, Sendable {
    case empty1
    case empty2
    case foo(Foo)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "empty1":
            self = .empty1
        case "empty2":
            self = .empty2
        case "foo":
            self = .foo(try Foo(from: decoder))
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
        case .empty1:
            try container.encode("empty1", forKey: .type)
        case .empty2:
            try container.encode("empty2", forKey: .type)
        case .foo(let data):
            try container.encode("foo", forKey: .type)
            try data.encode(to: encoder)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}