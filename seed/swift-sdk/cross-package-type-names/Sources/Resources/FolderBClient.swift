public final class FolderBClient: Sendable {
    public let common: CommonClient
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }
}