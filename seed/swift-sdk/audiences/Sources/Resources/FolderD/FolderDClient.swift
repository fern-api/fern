public final class FolderDClient: Sendable {
    public let service: ServiceClient
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.service = ServiceClient(config: config)
        self.httpClient = HTTPClient(config: config)
    }
}