public struct ListUsersExtendedResponse: Codable, Hashable {
    public let totalCount: Int

    enum CodingKeys: String, CodingKey {
        case totalCount = "total_count"
    }
}