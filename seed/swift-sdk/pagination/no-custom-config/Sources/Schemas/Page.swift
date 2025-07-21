public struct Page: Codable, Hashable {
    public let page: Int
    public let next: NextPage?
    public let perPage: Int
    public let totalPage: Int
    public let additionalProperties: [String: JSONValue]

    public init(page: Int, next: NextPage? = nil, perPage: Int, totalPage: Int, additionalProperties: [String: JSONValue] = .init()) {
        self.page = page
        self.next = next
        self.perPage = perPage
        self.totalPage = totalPage
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.page = try container.decode(Int.self, forKey: .page)
        self.next = try container.decodeIfPresent(NextPage.self, forKey: .next)
        self.perPage = try container.decode(Int.self, forKey: .perPage)
        self.totalPage = try container.decode(Int.self, forKey: .totalPage)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.page, forKey: .page)
        try container.encodeIfPresent(self.next, forKey: .next)
        try container.encode(self.perPage, forKey: .perPage)
        try container.encode(self.totalPage, forKey: .totalPage)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case page
        case next
        case perPage = "per_page"
        case totalPage = "total_page"
    }
}