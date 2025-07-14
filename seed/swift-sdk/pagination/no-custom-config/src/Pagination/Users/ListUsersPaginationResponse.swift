public struct ListUsersPaginationResponse: Codable, Hashable {
    public let hasNextPage: Bool?
    public let page: Page?
    public let totalCount: Int
    public let data: [User]

    enum CodingKeys: String, CodingKey {
        case hasNextPage
        case page
        case totalCount = "total_count"
        case data
    }
}