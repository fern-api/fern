public struct RefreshTokenRequest: Codable, Hashable, Sendable {
    public let ttl: Int
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        ttl: Int,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.ttl = ttl
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.ttl = try container.decode(Int.self, forKey: .ttl)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.ttl, forKey: .ttl)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case ttl
    }
}