public final class CompletionsClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func stream(requestOptions: RequestOptions? = nil) async throws -> Any {
    }
}