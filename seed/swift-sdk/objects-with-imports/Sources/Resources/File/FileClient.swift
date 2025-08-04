public final class FileClient: Sendable {
    public let directory: DirectoryClient
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.directory = DirectoryClient(config: config)
        self.httpClient = HTTPClient(config: config)
    }
}