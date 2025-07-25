public struct Metadata: Codable, Hashable, Sendable {
    public let id: Id
    public let value: Any
    public let additionalProperties: [String: JSONValue]

    public init(
        id: Id,
        value: Any,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.id = id
        self.value = value
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.id = try container.decode(Id.self, forKey: .id)
        self.value = try container.decode(Any.self, forKey: .value)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.id, forKey: .id)
        try container.encode(self.value, forKey: .value)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case id
        case value
    }
}