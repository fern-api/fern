public final class BasicAuthClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getWithBasicAuth(requestOptions: RequestOptions? = nil) async throws -> Bool {
        fatalError("Not implemented.")
    }

    public func postWithBasicAuth(requestOptions: RequestOptions? = nil) async throws -> Bool {
        fatalError("Not implemented.")
    }
}