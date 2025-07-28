public final class FileClient: Sendable {
    public let directory: DirectoryClient
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }
}