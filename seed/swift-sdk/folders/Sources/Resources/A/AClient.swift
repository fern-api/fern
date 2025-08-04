public final class AClient: Sendable {
    public let b: BClient
    public let c: CClient
    public let d: DClient
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.b = BClient(config: config)
        self.c = CClient(config: config)
        self.d = DClient(config: config)
        self.httpClient = HTTPClient(config: config)
    }
}