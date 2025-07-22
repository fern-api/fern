public final class FileClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }
}