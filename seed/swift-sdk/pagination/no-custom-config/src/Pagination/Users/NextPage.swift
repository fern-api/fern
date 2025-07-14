public struct NextPage: Codable, Hashable {
    public let page: Int
    public let startingAfter: String

    enum CodingKeys: String, CodingKey {
        case page
        case startingAfter = "starting_after"
    }
}