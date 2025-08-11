public struct Response: Codable, Hashable, Sendable {
    public let response: JSONValue
    public let identifiers: [Identifier]
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        response: JSONValue,
        identifiers: [Identifier],
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.response = response
        self.identifiers = identifiers
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.response = try container.decode(JSONValue.self, forKey: .response)
        self.identifiers = try container.decode([Identifier].self, forKey: .identifiers)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.response, forKey: .response)
        try container.encode(self.identifiers, forKey: .identifiers)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case response
        case identifiers
    }
}