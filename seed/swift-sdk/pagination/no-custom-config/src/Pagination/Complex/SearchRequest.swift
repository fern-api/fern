public struct SearchRequest: Codable, Hashable {
    public let pagination: StartingAfterPaging?
    public let query: SearchRequestQuery
    public let additionalProperties: [String: JSONValue]

    public init(pagination: StartingAfterPaging? = nil, query: SearchRequestQuery, additionalProperties: [String: JSONValue] = .init()) {
        self.pagination = pagination
        self.query = query
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.pagination = try container.decodeIfPresent(StartingAfterPaging.self, forKey: .pagination)
        self.query = try container.decode(SearchRequestQuery.self, forKey: .query)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.pagination, forKey: .pagination)
        try container.encode(self.query, forKey: .query)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case pagination
        case query
    }
}