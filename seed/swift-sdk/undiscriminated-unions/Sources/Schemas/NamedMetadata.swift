public struct NamedMetadata: Codable, Hashable, Sendable {
    public let name: String
    public let value: [String: JSONValue]
    public let additionalProperties: [String: JSONValue]

    public init(
        name: String,
        value: [String: JSONValue],
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.name = name
        self.value = value
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.name = try container.decode(String.self, forKey: .name)
        self.value = try container.decode([String: JSONValue].self, forKey: .value)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.name, forKey: .name)
        try container.encode(self.value, forKey: .value)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case name
        case value
    }
}