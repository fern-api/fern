public final class PutClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func add(requestOptions: RequestOptions? = nil) async throws -> PutResponse {
    }
}