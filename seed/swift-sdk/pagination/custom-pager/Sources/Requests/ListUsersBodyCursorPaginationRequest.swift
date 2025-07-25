public struct ListUsersBodyCursorPaginationRequest: Codable, Hashable {
    public let pagination: WithCursor?
    public let additionalProperties: [String: JSONValue]

    public init(
        pagination: WithCursor? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.pagination = pagination
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.pagination = try container.decodeIfPresent(WithCursor.self, forKey: .pagination)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.pagination, forKey: .pagination)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case pagination
    }
}