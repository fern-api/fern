public final class Level1Client: Sendable {
    public let level2: Level2Client
    public let types: TypesClient_
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.level2 = Level2Client(config: config)
        self.types = TypesClient_(config: config)
        self.httpClient = HTTPClient(config: config)
    }
}