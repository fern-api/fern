public struct DeleteUserRequest: Codable, Hashable, Sendable {
    /// The user to delete.
    public let username: JSONValue?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        username: JSONValue? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.username = username
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.username = try container.decodeIfPresent(JSONValue.self, forKey: .username)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.username, forKey: .username)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case username
    }
}