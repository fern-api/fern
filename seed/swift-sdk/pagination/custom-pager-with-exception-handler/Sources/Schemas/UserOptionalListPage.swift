public struct UserOptionalListPage: Codable, Hashable, Sendable {
    public let data: UserOptionalListContainer
    public let next: UUID?
    public let additionalProperties: [String: JSONValue]

    public init(
        data: UserOptionalListContainer,
        next: UUID? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.data = data
        self.next = next
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.data = try container.decode(UserOptionalListContainer.self, forKey: .data)
        self.next = try container.decodeIfPresent(UUID.self, forKey: .next)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.data, forKey: .data)
        try container.encodeIfPresent(self.next, forKey: .next)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case data
        case next
    }
}