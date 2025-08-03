public final class V3Client: Sendable {
    public let problem: ProblemClient__
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.problem = ProblemClient__(config: config)
        self.httpClient = HTTPClient(config: config)
    }
}