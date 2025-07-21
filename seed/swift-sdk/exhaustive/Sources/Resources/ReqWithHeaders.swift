public final class ReqWithHeadersClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getWithCustomHeader(xTestEndpointHeader: String, requestOptions: RequestOptions? = nil) async throws -> Any {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/test-headers/custom-header", 
            headers: [:], 
            requestOptions: requestOptions
        )
    }
}