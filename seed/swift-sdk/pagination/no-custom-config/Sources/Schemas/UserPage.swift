public struct UserPage: Codable, Hashable {
    public let data: UserListContainer
    public let next: UUID?
    public let additionalProperties: [String: JSONValue]

    public init(data: UserListContainer, next: UUID? = nil, additionalProperties: [String: JSONValue] = .init()) {
        self.data = data
        self.next = next
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.data = try container.decode(UserListContainer.self, forKey: .data)
        self.next = try container.decodeIfPresent(UUID.self, forKey: .next)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.data, forKey: .data)
        try container.encodeIfPresent(self.next, forKey: .next)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case data
        case next
    }
}