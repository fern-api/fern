public struct PaginatedConversationResponse: Codable, Hashable {
    public let conversations: [Conversation]
    public let pages: CursorPages?
    public let totalCount: Int
    public let type: Any

    enum CodingKeys: String, CodingKey {
        case conversations
        case pages
        case totalCount = "total_count"
        case type
    }
}