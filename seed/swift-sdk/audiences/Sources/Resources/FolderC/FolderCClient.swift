public final class FolderCClient: Sendable {
    public let common: CommonClient_
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.common = CommonClient_(config: config)
        self.httpClient = HTTPClient(config: config)
    }
}