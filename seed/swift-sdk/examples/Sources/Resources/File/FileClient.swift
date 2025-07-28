public final class FileClient: Sendable {
    public let notification: NotificationClient
    public let service: ServiceClient
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.notification = NotificationClient(config: config)
        self.service = ServiceClient(config: config)
        self.httpClient = HTTPClient(config: config)
    }
}