public struct Page: Codable, Hashable {
    public let page: Int
    public let next: NextPage?
    public let perPage: Int
    public let totalPage: Int

    enum CodingKeys: String, CodingKey {
        case page
        case next
        case perPage = "per_page"
        case totalPage = "total_page"
    }
}