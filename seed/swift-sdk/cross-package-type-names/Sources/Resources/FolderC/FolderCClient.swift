public final class FolderCClient: Sendable {
    public let common: CommonClient
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.common = CommonClient(config: config)
        self.httpClient = HTTPClient(config: config)
    }
}