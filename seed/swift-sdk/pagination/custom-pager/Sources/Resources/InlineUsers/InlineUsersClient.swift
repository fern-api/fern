import Foundation

public final class InlineUsersClient: Sendable {
    public let inlineUsers: InlineUsersInlineUsersClient
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.inlineUsers = InlineUsersInlineUsersClient(config: config)
        self.httpClient = HTTPClient(config: config)
    }
}