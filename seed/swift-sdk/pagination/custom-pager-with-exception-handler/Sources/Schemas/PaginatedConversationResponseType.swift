import Foundation

public enum PaginatedConversationResponseType: String, Codable, Hashable, CaseIterable, Sendable {
    case conversationList = "conversation.list"
}