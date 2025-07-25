public struct Response: Codable, Hashable {
    public let response: Any
    public let identifiers: [Identifier]
    public let additionalProperties: [String: JSONValue]

    public init(
        response: Any,
        identifiers: [Identifier],
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.response = response
        self.identifiers = identifiers
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.response = try container.decode(Any.self, forKey: .response)
        self.identifiers = try container.decode([Identifier].self, forKey: .identifiers)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.response, forKey: .response)
        try container.encode(self.identifiers, forKey: .identifiers)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case response
        case identifiers
    }
}