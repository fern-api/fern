public final class ServiceClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func post(endpointParam: String, requestOptions: RequestOptions? = nil) async throws -> Any {
        return try await httpClient.performRequest(
            method: .post,
            path: "/\(endpointParam)",
            requestOptions: requestOptions,
            responseType: Any.self
        )
    }
}