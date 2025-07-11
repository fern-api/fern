public struct PaginatedConversationResponse {
    public let conversations: [Conversation]
    public let pages: CursorPages?
    public let totalCount: Int
    public let type: Any
}