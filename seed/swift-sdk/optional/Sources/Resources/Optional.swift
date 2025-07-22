public final class OptionalClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func sendOptionalBody(request: Any?, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/send-optional-body", 
            body: request, 
            requestOptions: requestOptions
        )
    }
}