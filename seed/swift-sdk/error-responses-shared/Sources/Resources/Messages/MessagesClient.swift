import Foundation

public final class MessagesClient: Sendable {
    public let messages: MessagesMessagesClient
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.messages = MessagesMessagesClient(config: config)
        self.httpClient = HTTPClient(config: config)
    }
}