public final class ComplexClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func search(index: String, requestOptions: RequestOptions? = nil) async throws -> PaginatedConversationResponse {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/\(index)/conversations/search", 
            requestOptions: requestOptions
        )
    }
}