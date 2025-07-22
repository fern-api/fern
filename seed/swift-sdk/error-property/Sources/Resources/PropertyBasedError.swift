public final class PropertyBasedErrorClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func throwError(requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .get,
            path: "/property-based-error",
            requestOptions: requestOptions,
            responseType: String.self
        )
    }
}