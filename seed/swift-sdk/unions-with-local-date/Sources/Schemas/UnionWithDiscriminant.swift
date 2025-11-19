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
            self = .bar(try Bar(from: decoder))
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
        switch self {
        case .bar(let data):
            try data.encode(to: encoder)
        case .foo(let data):
            try data.encode(to: encoder)
        }
    }

    /// This is a Foo field.
    public struct Foo: Codable, Hashable, Sendable {
        public let type: String = "foo"
        public let foo: Unions.Foo
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            foo: Unions.Foo,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.foo = foo
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.foo = try container.decode(Unions.Foo.self, forKey: .foo)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.foo, forKey: .foo)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type = "_type"
            case foo
        }
    }

    public struct Bar: Codable, Hashable, Sendable {
        public let type: String = "bar"
        public let bar: Unions.Bar
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            bar: Unions.Bar,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.bar = bar
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.bar = try container.decode(Unions.Bar.self, forKey: .bar)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.bar, forKey: .bar)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type = "_type"
            case bar
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type = "_type"
    }
}