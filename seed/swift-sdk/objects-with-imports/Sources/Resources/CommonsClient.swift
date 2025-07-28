public final class CommonsClient: Sendable {
    public let metadata: MetadataClient
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }
}