public final class ComplexClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func search(index: String, request: SearchRequest, requestOptions: RequestOptions? = nil) async throws -> PaginatedConversationResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/\(index)/conversations/search",
            body: request,
            requestOptions: requestOptions,
            responseType: PaginatedConversationResponse.self
        )
    }
}