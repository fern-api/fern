public final class DummyClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getDummy(requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .get,
            path: "/dummy",
            requestOptions: requestOptions,
            responseType: String.self
        )
    }
}