public final class DummyClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func generateStream(requestOptions: RequestOptions? = nil) async throws -> Any {
        fatalError("Not implemented.")
    }

    public func generate(requestOptions: RequestOptions? = nil) async throws -> StreamResponse {
        fatalError("Not implemented.")
    }
}