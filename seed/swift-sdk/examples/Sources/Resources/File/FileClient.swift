public final class FileClient: Sendable {
    public let notification: NotificationClient
    public let service: ServiceClient_
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.notification = NotificationClient(config: config)
        self.service = ServiceClient_(config: config)
        self.httpClient = HTTPClient(config: config)
    }
}