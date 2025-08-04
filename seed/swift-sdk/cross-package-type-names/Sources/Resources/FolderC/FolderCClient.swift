public final class FolderCClient: Sendable {
    public let common: FolderCCommonClient
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.common = FolderCCommonClient(config: config)
        self.httpClient = HTTPClient(config: config)
    }
}