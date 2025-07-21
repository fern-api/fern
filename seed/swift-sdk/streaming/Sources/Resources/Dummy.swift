public final class DummyClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func generateStream(requestOptions: RequestOptions? = nil) async throws -> Any {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/generate-stream", 
            requestOptions: requestOptions
        )
    }

    public func generate(requestOptions: RequestOptions? = nil) async throws -> StreamResponse {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/generate", 
            requestOptions: requestOptions
        )
    }
}