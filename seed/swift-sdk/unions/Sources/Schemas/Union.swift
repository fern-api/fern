public enum Union: Codable, Hashable, Sendable {
    case foo(Foo)
    case bar(Bar)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "foo":
            self = .foo(try Foo(from: decoder))
        case "bar":
            self = .bar(try Bar(from: decoder))
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
        case .foo(let data):
            try data.encode(to: encoder)
        case .bar(let data):
            try data.encode(to: encoder)
        }
    }

    public struct Foo: Codable, Hashable, Sendable {
        public let type: String = "foo"
        public let foo: Foo
        public let additionalProperties: [String: JSONValue]

        public init(
            foo: Foo,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.foo = foo
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.foo = try container.decode(Foo.self, forKey: .foo)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.foo, forKey: .foo)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case foo
        }
    }

    public struct Bar: Codable, Hashable, Sendable {
        public let type: String = "bar"
        public let bar: Bar
        public let additionalProperties: [String: JSONValue]

        public init(
            bar: Bar,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.bar = bar
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.bar = try container.decode(Bar.self, forKey: .bar)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.bar, forKey: .bar)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case bar
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}