public struct ListUsersMixedTypePaginationResponse: Codable, Hashable, Sendable {
    public let next: String
    public let data: [User]
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        next: String,
        data: [User],
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.next = next
        self.data = data
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.next = try container.decode(String.self, forKey: .next)
        self.data = try container.decode([User].self, forKey: .data)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.next, forKey: .next)
        try container.encode(self.data, forKey: .data)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case next
        case data
    }
}