public final class FooClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func find(requestOptions: RequestOptions? = nil) async throws -> ImportingType {
    }
}