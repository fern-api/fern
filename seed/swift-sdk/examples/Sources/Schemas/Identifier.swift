public struct Identifier: Codable, Hashable {
    public let type: Type
    public let value: String
    public let label: String
    public let additionalProperties: [String: JSONValue]

    public init(
        type: Type,
        value: String,
        label: String,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.type = type
        self.value = value
        self.label = label
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.type = try container.decode(Type.self, forKey: .type)
        self.value = try container.decode(String.self, forKey: .value)
        self.label = try container.decode(String.self, forKey: .label)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.type, forKey: .type)
        try container.encode(self.value, forKey: .value)
        try container.encode(self.label, forKey: .label)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
        case value
        case label
    }
}