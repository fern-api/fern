public final class CommonsClient: Sendable {
    public let metadata: MetadataClient
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.metadata = MetadataClient(config: config)
        self.httpClient = HTTPClient(config: config)
    }
}