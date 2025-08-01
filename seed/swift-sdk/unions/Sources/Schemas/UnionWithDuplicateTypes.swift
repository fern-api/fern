public enum UnionWithDuplicateTypes: Codable, Hashable, Sendable {
    case foo1(Foo1)
    case foo2(Foo2)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
    }

    public struct Foo1: Codable, Hashable, Sendable {
        public let type: String = "foo1"
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
            try container.encode(self.name, forKey: .name)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case name
        }
    }

    public struct Foo2: Codable, Hashable, Sendable {
        public let type: String = "foo2"
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
            try container.encode(self.name, forKey: .name)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case name
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}