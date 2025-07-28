public final class FolderCClient: Sendable {
    public let common: CommonClient
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }
}