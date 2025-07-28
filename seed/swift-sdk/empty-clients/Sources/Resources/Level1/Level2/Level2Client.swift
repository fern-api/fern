public final class Level2Client: Sendable {
    public let types: TypesClient
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.types = TypesClient(config: config)
        self.httpClient = HTTPClient(config: config)
    }
}