public final class NoAuthClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func postWithNoAuth(requestOptions: RequestOptions? = nil) async throws -> Bool {
        fatalError("Not implemented.")
    }
}