public struct ListUsersPaginationResponse: Codable, Hashable {
    public let hasNextPage: Bool?
    public let page: Page?
    public let totalCount: Int
    public let data: [User]
    public let additionalProperties: [String: JSONValue]

    public init(
        hasNextPage: Bool? = nil,
        page: Page? = nil,
        totalCount: Int,
        data: [User],
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.hasNextPage = hasNextPage
        self.page = page
        self.totalCount = totalCount
        self.data = data
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.hasNextPage = try container.decodeIfPresent(Bool.self, forKey: .hasNextPage)
        self.page = try container.decodeIfPresent(Page.self, forKey: .page)
        self.totalCount = try container.decode(Int.self, forKey: .totalCount)
        self.data = try container.decode([User].self, forKey: .data)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.hasNextPage, forKey: .hasNextPage)
        try container.encodeIfPresent(self.page, forKey: .page)
        try container.encode(self.totalCount, forKey: .totalCount)
        try container.encode(self.data, forKey: .data)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case hasNextPage
        case page
        case totalCount = "total_count"
        case data
    }
}