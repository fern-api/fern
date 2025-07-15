public struct CursorPages: Codable, Hashable {
    public let next: StartingAfterPaging?
    public let page: Int?
    public let perPage: Int?
    public let totalPages: Int?
    public let type: Any

    enum CodingKeys: String, CodingKey {
        case next
        case page
        case perPage = "per_page"
        case totalPages = "total_pages"
        case type
    }
}