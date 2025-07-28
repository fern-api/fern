public final class AClient: Sendable {
    public let b: BClient
    public let c: CClient
    public let d: DClient
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }
}