public final class ComplexClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func search(requestOptions: RequestOptions? = nil) throws -> PaginatedConversationResponse {
    }
}