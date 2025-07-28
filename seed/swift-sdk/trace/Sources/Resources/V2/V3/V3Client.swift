public final class V3Client: Sendable {
    public let problem: ProblemClient
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }
}