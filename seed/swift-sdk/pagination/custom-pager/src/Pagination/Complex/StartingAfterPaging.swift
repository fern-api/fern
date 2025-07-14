public struct StartingAfterPaging: Codable, Hashable {
    public let perPage: Int
    public let startingAfter: String?

    enum CodingKeys: String, CodingKey {
        case perPage = "per_page"
        case startingAfter = "starting_after"
    }
}