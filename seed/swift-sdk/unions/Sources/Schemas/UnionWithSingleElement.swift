public enum UnionWithSingleElement: Codable, Hashable, Sendable {
    case foo(Foo)

    public struct Foo: Codable, Hashable, Sendable {
        public let type: String = "foo"
        public let name: String
        public let additionalProperties: [String: JSONValue]
        public let _additionalProperties: [String: JSONValue]

        public init(
            name: String,
            additionalProperties: [String: JSONValue],
            _additionalProperties: [String: JSONValue] = .init()
        ) {
            self.name = name
            self.additionalProperties = additionalProperties
            self._additionalProperties = _additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.name = try container.decode(String.self, forKey: .name)
            self.additionalProperties = try container.decode([String: JSONValue].self, forKey: .additionalProperties)
            self._additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self._additionalProperties)
            try container.encode(self.name, forKey: .name)
            try container.encode(self.additionalProperties, forKey: .additionalProperties)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case name = "placeholder"
            case additionalProperties = "placeholder"
        }
    }
}