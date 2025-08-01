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
        switch self {
        case .foo(let data):
            try data.encode(to: encoder)
        case .fooExtended(let data):
            try data.encode(to: encoder)
        }
    }

    public struct Foo: Codable, Hashable, Sendable {
        public let type: String = "foo"
        public let name: String
        public let additionalProperties: [String: JSONValue]

        public init(
            name: String,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.name = name
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.name = try container.decode(String.self, forKey: .name)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.name, forKey: .name)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case name
        }
    }

    public struct FooExtended: Codable, Hashable, Sendable {
        public let type: String = "fooExtended"
        public let age: Int
        public let additionalProperties: [String: JSONValue]

        public init(
            age: Int,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.age = age
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.age = try container.decode(Int.self, forKey: .age)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.age, forKey: .age)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case age
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}