public final class V2Client: Sendable {
    public let problem: V2ProblemClient
    public let v3: V3Client
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.problem = V2ProblemClient(config: config)
        self.v3 = V3Client(config: config)
        self.httpClient = HTTPClient(config: config)
    }

    public func test(requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .get,
            path: "/",
            requestOptions: requestOptions
        )
    }
}