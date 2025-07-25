public struct UserListContainer: Codable, Hashable {
    public let users: [User]
    public let additionalProperties: [String: JSONValue]

    public init(users: [User], additionalProperties: [String: JSONValue] = .init()) {
        self.users = users
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.users = try container.decode([User].self, forKey: .users)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.users, forKey: .users)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case users
    }
}