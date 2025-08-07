public struct NestedUser: Codable, Hashable, Sendable {
    public let name: String?
    public let user: User?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        name: String? = nil,
        user: User? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.name = name
        self.user = user
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.name = try container.decodeIfPresent(String.self, forKey: .name)
        self.user = try container.decodeIfPresent(User.self, forKey: .user)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.name, forKey: .name)
        try container.encodeIfPresent(self.user, forKey: .user)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case name
        case user
    }
}