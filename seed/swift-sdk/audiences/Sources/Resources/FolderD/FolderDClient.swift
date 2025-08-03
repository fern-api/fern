public final class FolderDClient: Sendable {
    public let service: ServiceClient_
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.service = ServiceClient_(config: config)
        self.httpClient = HTTPClient(config: config)
    }
}