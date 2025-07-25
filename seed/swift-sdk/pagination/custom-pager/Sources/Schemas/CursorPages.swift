public struct CursorPages: Codable, Hashable {
    public let next: StartingAfterPaging?
    public let page: Int?
    public let perPage: Int?
    public let totalPages: Int?
    public let type: Any
    public let additionalProperties: [String: JSONValue]

    public init(
        next: StartingAfterPaging? = nil,
        page: Int? = nil,
        perPage: Int? = nil,
        totalPages: Int? = nil,
        type: Any,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.next = next
        self.page = page
        self.perPage = perPage
        self.totalPages = totalPages
        self.type = type
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.next = try container.decodeIfPresent(StartingAfterPaging.self, forKey: .next)
        self.page = try container.decodeIfPresent(Int.self, forKey: .page)
        self.perPage = try container.decodeIfPresent(Int.self, forKey: .perPage)
        self.totalPages = try container.decodeIfPresent(Int.self, forKey: .totalPages)
        self.type = try container.decode(Any.self, forKey: .type)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.next, forKey: .next)
        try container.encodeIfPresent(self.page, forKey: .page)
        try container.encodeIfPresent(self.perPage, forKey: .perPage)
        try container.encodeIfPresent(self.totalPages, forKey: .totalPages)
        try container.encode(self.type, forKey: .type)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case next
        case page
        case perPage = "per_page"
        case totalPages = "total_pages"
        case type
    }
}