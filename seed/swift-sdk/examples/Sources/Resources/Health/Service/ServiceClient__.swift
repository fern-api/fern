public final class ServiceClient__: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func check(id: String, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .get,
            path: "/check/\(id)",
            requestOptions: requestOptions
        )
    }

    public func ping(requestOptions: RequestOptions? = nil) async throws -> Bool {
        return try await httpClient.performRequest(
            method: .get,
            path: "/ping",
            requestOptions: requestOptions,
            responseType: Bool.self
        )
    }
}