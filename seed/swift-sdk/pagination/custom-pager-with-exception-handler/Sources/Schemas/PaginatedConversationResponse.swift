import Foundation

public struct PaginatedConversationResponse: Codable, Hashable, Sendable {
    public let conversations: [Conversation]
    public let pages: CursorPages?
    public let totalCount: Int
    public let type: ConversationList
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        conversations: [Conversation],
        pages: CursorPages? = nil,
        totalCount: Int,
        type: ConversationList,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.conversations = conversations
        self.pages = pages
        self.totalCount = totalCount
        self.type = type
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.conversations = try container.decode([Conversation].self, forKey: .conversations)
        self.pages = try container.decodeIfPresent(CursorPages.self, forKey: .pages)
        self.totalCount = try container.decode(Int.self, forKey: .totalCount)
        self.type = try container.decode(ConversationList.self, forKey: .type)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.conversations, forKey: .conversations)
        try container.encodeIfPresent(self.pages, forKey: .pages)
        try container.encode(self.totalCount, forKey: .totalCount)
        try container.encode(self.type, forKey: .type)
    }

    public enum ConversationList: String, Codable, Hashable, CaseIterable, Sendable {
        case conversationList = "conversation.list"
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case conversations
        case pages
        case totalCount = "total_count"
        case type
    }
}