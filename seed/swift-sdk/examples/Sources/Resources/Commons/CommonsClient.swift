public final class CommonsClient: Sendable {
    public let types: TypesClient
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }
}