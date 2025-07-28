public final class DClient: Sendable {
    public let types: TypesClient
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }
}