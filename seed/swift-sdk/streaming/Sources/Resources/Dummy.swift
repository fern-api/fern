public final class DummyClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func generateStream(requestOptions: RequestOptions? = nil) throws -> Any {
    }

    public func generate(requestOptions: RequestOptions? = nil) throws -> StreamResponse {
    }
}